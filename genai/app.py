from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import openai
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Access values
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

app = FastAPI()

# Allow frontend from localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create engine from user's connection details
def create_dynamic_engine(conn):
    try:
        db_url = (
            f"mysql+pymysql://{conn['user']}:{conn['password']}"
            f"@{conn['host']}:{conn['port']}/{conn['database']}"
        )
        return create_engine(db_url)
    except Exception as e:
        raise ValueError(f"Invalid connection: {e}")

@app.post("/query")
async def query_db(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    conn_info = body.get("connection", {})

    if not prompt or not conn_info:
        return {"error": "Prompt or DB connection details missing."}

    try:
        engine = create_dynamic_engine(conn_info)

        # Ask OpenAI to extract table names
        table_names_resp = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Extract table names used in the prompt. Comma-separated, no explanation."},
                {"role": "user", "content": prompt}
            ]
        )
        tables = [t.strip() for t in table_names_resp["choices"][0]["message"]["content"].split(",")]

        # Get schema from MySQL
        schema_parts = []
        with engine.begin() as conn:
            for table in tables:
                try:
                    rows = conn.execute(text(f"DESCRIBE {table}")).fetchall()
                    columns = [f"{row[0]} {row[1]}" for row in rows]
                    schema_parts.append(f"{table}({', '.join(columns)})")
                except Exception as e:
                    return {"error": f"Schema error for '{table}': {e}"}

        schema = "\n".join(schema_parts)

        # Ask OpenAI to generate SQL using schema
        system_prompt = f"""You are a MySQL expert.
Use the schema below to write a valid SQL query for the user's prompt.

{schema}

Return only the SQL query, nothing else.
"""

        sql_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )

        sql = sql_response["choices"][0]["message"]["content"].strip()

        # Execute the SQL query
        with engine.begin() as conn:
            result = conn.execute(text(sql))
            if sql.lower().startswith("select"):
                rows = [dict(row._mapping) for row in result]
                return {"sql": sql, "data": rows}
            else:
                return {"sql": sql, "message": f"{result.rowcount} rows affected."}

    except Exception as e:
        return {"error": f"Server error: {e}"}