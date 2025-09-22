�
�
 Full Local Setup Guide: React + FastAPI + MySQL + 
OpenAI 
✅
 Step 1: Create project folder and Python virtual environment 
mkdir genai 
cd genai 
python3 -m venv venv 
source venv/bin/activate  # On Windows: venv\\Scripts\\activate 
✅
 Step 2: Create and install backend dependencies 
pip install fastapi uvicorn sqlalchemy pymysql openai==0.28 
Then create a file: 
�
�
 app.py 
from fastapi import FastAPI, Request 
from fastapi.middleware.cors import CORSMiddleware 
from sqlalchemy import create_engine, text 
import openai 
openai.api_key = "" 
app = FastAPI() 
linkedin.com/in/sbgowtham/
 # Allow frontend from localhost:5173 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
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
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
   body = await request.json() 
   prompt = body.get("prompt", "") 
   conn_info = body.get("connection", {}) 
 
   if not prompt or not conn_info: 
       return {"error": "Prompt or DB connection details 
missing."} 
 
   try: 
       engine = create_dynamic_engine(conn_info) 
 
       # Ask OpenAI to extract table names 
       table_names_resp = openai.ChatCompletion.create( 
           model="gpt-4", 
           messages=[ 
               {"role": "system", "content": "Extract 
table names used in the prompt. Comma-separated, no 
explanation."}, 
               {"role": "user", "content": prompt} 
           ] 
       ) 
       tables = [t.strip() for t in 
table_names_resp["choices"][0]["message"]["content"].spli
 t(",")] 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
 
       # Get schema from MySQL 
       schema_parts = [] 
       with engine.begin() as conn: 
           for table in tables: 
               try: 
                   rows = conn.execute(text(f"DESCRIBE 
{table}")).fetchall() 
                   columns = [f"{row[0]} {row[1]}" for 
row in rows] 
                   schema_parts.append(f"{table}({', 
'.join(columns)})") 
               except Exception as e: 
                   return {"error": f"Schema error for 
'{table}': {e}"} 
 
       schema = "\n".join(schema_parts) 
 
       # Ask OpenAI to generate SQL using schema 
       system_prompt = f"""You are a MySQL expert. 
Use the schema below to write a valid SQL query for the 
user's prompt. 
 
{schema} 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
 
Return only the SQL query, nothing else. 
""" 
 
       sql_response = openai.ChatCompletion.create( 
           model="gpt-4", 
           messages=[ 
               {"role": "system", "content": 
system_prompt}, 
               {"role": "user", "content": prompt} 
           ] 
       ) 
 
       sql = 
sql_response["choices"][0]["message"]["content"].strip() 
 
       # Execute the SQL query 
       with engine.begin() as conn: 
           result = conn.execute(text(sql)) 
           if sql.lower().startswith("select"): 
               rows = [dict(row._mapping) for row in 
result] 
               return {"sql": sql, "data": rows} 
Gowtham SB 
www.linkedin.com/in/sbgowtham/      
else: 
return {"sql": sql, "message": 
f"{result.rowcount} rows affected."} 
except Exception as e: 
return {"error": f"Server error: {e}"} 
Paste your full FastAPI backend code there. 
✅
 Step 3: Set up your local MySQL database 
Make sure you have MySQL installed locally. 
Then log in: 
mysql -u root -p 
Run: 
CREATE DATABASE test; 
USE test; 
CREATE TABLE users ( 
id INT PRIMARY KEY, 
name VARCHAR(100), 
email VARCHAR(100) 
); 
INSERT INTO users (id, name, email) VALUES 
(1, 'Alice', 'alice@example.com'), 
(2, 'Bob', 'bob@example.com'), 
(3, 'Charlie', 'charlie@example.com'), 
(4, 'David', 'david@example.com'), 
(5, 'Eva', 'eva@example.com'), 
(6, 'Frank', 'frank@example.com'), 
(7, 'Grace', 'grace@example.com'), 
linkedin.com/in/sbgowtham/
Gowtham SB 
www.linkedin.com/in/sbgowtham/      
(8, 'Henry', 'henry@example.com'), 
(9, 'Ivy', 'ivy@example.com'), 
(10, 'Jake', 'jake@example.com'); 
CREATE TABLE transactions ( 
id INT PRIMARY KEY, 
user_id INT, 
amount DECIMAL(10,2), 
status VARCHAR(50) 
); 
INSERT INTO transactions (id, user_id, amount, status) VALUES 
(1, 1, 250.00, 'completed'), 
(2, 2, 130.50, 'refunded'), 
(3, 3, 90.00, 'pending'), 
(4, 4, 400.00, 'completed'), 
(5, 5, 50.00, 'cancelled'), 
(6, 6, 180.75, 'completed'), 
(7, 7, 600.00, 'completed'), 
(8, 8, 30.00, 'failed'), 
(9, 9, 120.00, 'pending'), 
(10, 10, 200.00, 'completed'); 
Add some sample records if needed. 
✅
 Step 4: Create frontend (React) project 
Open a new terminal window/tab (keep backend one active). 
npm create vite@latest nl_sql_ui_app -- --template react 
cd nl_sql_ui_app 
npm install 
✅
 Step 5: Setup React frontend 
● Go to src/App.jsx 
linkedin.com/in/sbgowtham/
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
Code: 
 
import React, { useState, useEffect, useRef } from 
'react'; 
 
export default function App() { 
 const [prompt, setPrompt] = useState(''); 
 const [responseData, setResponseData] = useState(null); 
 const [error, setError] = useState(''); 
 const [loading, setLoading] = useState(false); 
 const [connection, setConnection] = useState({ host: '', 
port: '', user: '', password: '', database: '' }); 
 const scrollRef = useRef(null); 
 
 const handleSubmit = async () => { 
   if (!prompt.trim()) { 
     setError('Please enter a prompt before 
submitting.'); 
     return; 
   } 
 
   setLoading(true); 
   setError(''); 
   setResponseData(null); 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
 
   try { 
     const res = await 
fetch('http://localhost:8000/query', { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' }, 
       body: JSON.stringify({ prompt, connection }) 
     }); 
     const result = await res.json(); 
     if (result.error) { 
       setError(result.error); 
     } else { 
       setResponseData(result); 
     } 
   } catch (err) { 
     setError('Failed to connect to server'); 
   } 
   setLoading(false); 
 }; 
 
 useEffect(() => { 
   if (scrollRef.current) { 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
     scrollRef.current.scrollIntoView({ behavior: 
'smooth' }); 
   } 
 }, [responseData]); 
 
 const handleClear = () => { 
   setPrompt(''); 
   setResponseData(null); 
   setError(''); 
 }; 
 
 const handleConnectionChange = (e) => { 
   setConnection({ ...connection, [e.target.name]: 
e.target.value }); 
 }; 
 
 return ( 
   <div className="min-h-screen bg-[#1e1e1e] text-white 
flex flex-col items-center justify-center p-4"> 
     <div className="w-full max-w-3xl bg-[#2d2d2d] p-6 
rounded-xl shadow-xl text-center"> 
       <div className="flex items-center justify-center 
h-[60vh] w-full"> 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
         <h1 className="text-3xl font-bold 
text-center">Talk To DB</h1> 
       </div> 
 
       <div className="grid grid-cols-2 gap-4 text-left 
mb-6"> 
         {['host', 'port', 'user', 'password', 
'database'].map((field) => ( 
           <input 
             key={field} 
             name={field} 
             value={connection[field]} 
             onChange={handleConnectionChange} 
             placeholder={field.charAt(0).toUpperCase() + 
field.slice(1)} 
             className="bg-[#3b3b3b] text-white p-2 
rounded focus:outline-none placeholder-gray-400" 
             type={field === 'password' ? 'password' : 
'text'} 
           /> 
         ))} 
       </div> 
 
       <div className="w-full bg-[#3b3b3b] rounded-xl p-4 
mb-6"> 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
         <textarea 
           value={prompt} 
           onChange={(e) => setPrompt(e.target.value)} 
           className="w-full h-[180px] p-4 text-lg 
text-white bg-transparent focus:outline-none resize-none 
placeholder-gray-400 rounded" 
           placeholder="Type your SQL-related prompt 
here..." 
         ></textarea> 
       </div> 
 
       <div className="flex flex-col md:flex-row 
justify-center gap-4"> 
         <button 
           onClick={handleSubmit} 
           disabled={loading} 
           className="bg-green-400 text-white px-8 py-3 
rounded hover:bg-green-300 text-lg font-medium" 
         > 
           {loading ? 'Generating...' : 'Run Query'} 
         </button> 
         <button 
           onClick={handleClear} 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
           className="bg-red-600 text-white px-8 py-3 
rounded hover:bg-red-700 text-lg font-medium" 
         > 
           Clear 
         </button> 
       </div> 
 
       {error && <p className="text-red-400 mt-6 
text-lg">
 ❌
 {error}</p>} 
 
       {responseData && ( 
         <div ref={scrollRef} className="mt-8 text-left 
w-full"> 
           <p className="font-semibold text-lg 
mb-2">Generated SQL:</p> 
           <div className="mb-4"> 
             <div className="relative bg-black 
text-green-400 p-4 pl-5 pr-5 rounded text-sm font-mono 
ring-2 ring-green-500 shadow-lg overflow-x-auto 
whitespace-pre-wrap break-words"> 
               {responseData.sql} 
             </div> 
             <div className="text-right mt-2"> 
               <button 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
                 onClick={() => 
navigator.clipboard.writeText(responseData.sql)} 
                 className="bg-gray-700 text-white 
text-xs px-3 py-1 rounded hover:bg-gray-600" 
               > 
                 Copy 
               </button> 
             </div> 
           </div> 
 
           <p className="font-semibold text-lg 
mb-2">Output:</p> 
           <div className="overflow-x-auto mt-6 border 
rounded"> 
             <table className="min-w-full divide-y 
divide-gray-700"> 
               <thead className="bg-gray-800"> 
                 <tr> 
                   {Object.keys(responseData.data[0] || 
{}).map((key) => ( 
                     <th key={key} className="px-4 py-2 
text-sm font-medium text-gray-300 border-b text-center"> 
                       {key} 
                     </th> 
                   ))} 
linkedin.com/in/sbgowtham/
 Gowtham SB 
www.linkedin.com/in/sbgowtham/      
                 </tr> 
               </thead> 
               <tbody className="bg-[#1e1e1e] divide-y 
divide-gray-700"> 
                 {responseData.data.map((row, rowIndex) 
=> ( 
                   <tr key={rowIndex}> 
                     {Object.values(row).map((value, 
colIndex) => ( 
                       <td key={colIndex} className="px-4 
py-2 text-sm text-gray-200 border-b text-center"> 
                         {value} 
                       </td> 
                     ))} 
                   </tr> 
                 ))} 
               </tbody> 
             </table> 
           </div> 
         </div> 
       )} 
     </div> 
   </div> 
Gowtham SB 
www.linkedin.com/in/sbgowtham/      
); 
} 
● Paste the updated frontend code you’ve been using (with the disclaimer, Gowtham SB 
credit, prompt validation, etc.) 
● In fetch call, use this during local dev: 
fetch('http://localhost:8000/query', { ... }) 
✅
 Step 6: Build & serve React (optional for prod-like feel) 
If you want to build and serve like production: 
npm run build 
npx serve -s dist -l 5173 
For aws - sudo npx serve -s dist -l 80 or pm2 start "npx serve -s dist -l 80" --name talktodb-ui 
But during development, just run: 
npm run dev 
✅
 Step 7: Run FastAPI backend 
Back in the backend terminal: 
uvicorn app:app --host 0.0.0.0 --port 8000 
✅
 Step 8: Make sure it all works 
linkedin.com/in/sbgowtham/
Gowtham SB 
www.linkedin.com/in/sbgowtham/      
Now in browser, visit: 
http://localhost:5173 
When you submit prompts like: 
Get all transactions where amount > 100 
You should see SQL + output. 
�
�
 Final Notes 
● 
✅
 React runs on port 5173 
● 
✅
 FastAPI runs on port 8000 
● 
✅
 MySQL is accessed locally with localhost 
● 
✅
 You can use .env files later for keys/configs 
Let me know if you want a bash script version of this setup or want to dockerize it for easy 
reuse 
�
