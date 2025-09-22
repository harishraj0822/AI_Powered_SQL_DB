Project Title: AI-Powered SQL — Natural Language Interface to SQL Database 

Summary: AI-Powered SQL is an interface that allows users to interact with a MySQL 
database using plain English prompts. It leverages OpenAI's GPT-4 model to convert natural 
language queries into optimized SQL statements, execute them on the database, and return 
results in a user-friendly UI. This eliminates the need for end users to know SQL, making data 
more accessible to non-technical teams. 


Architecture & Stack: 
● Frontend: React + Vite (served using serve in local or EC2) 
● Backend: FastAPI 
● Database: MySQL (Local or EC2-based) 
● AI Model: OpenAI GPT-4 via OpenAI Python SDK (v0.28) 
● Deployment: Can run locally, or on EC2 with domain mapping (e.g., datajob.in)


Key Features: 
● Natural language to SQL conversion 
● Query restrictions to prevent DML (INSERT/UPDATE/DELETE) 
● Only allows interaction with users and transactions tables 
● Handles JOINs, subqueries, and aggregations 
● UI displays generated SQL and results in a clean, tabular format 
● CORS-enabled FastAPI server to interact with frontend 
● Domain-branded with LinkedIn attribution for creator visibility


Use Cases: 
● Business users querying reports without SQL knowledge 
● Internal tools for analytics teams 
● Interview-ready showcase of LLM+SQL+Web integration


How to Present in Interviews:
Storyline for Interviews: "I built a GenAI-based product called AI-Powered SQL, which allows any 
user to ask questions in plain English and get answers from a structured SQL database. The 
core idea was to abstract away SQL complexity for business and non-tech users." 


Skills Demonstrated: 
● Fullstack development (React + FastAPI) 
● AI Integration (OpenAI GPT-4) 
● REST APIs and CORS handling 
● SQL understanding and schema design 
● Python backend with error handling and table introspection 
● Clean UI/UX with prompt validation and security checks


Project Walkthrough Tips: 
● Start with the problem: Non-SQL users need data access. 
● Explain the solution: Input prompt → GPT → SQL → MySQL → Output. 
● Show UI (if possible): Walk through typing a prompt and getting results. 
● Explain restrictions: Users can’t modify data; only read queries with allowed tables. 
● Deployment: Mention local setup + EC2 + domain + CORS config.
● Bonus: Add that you handled prompt filtering and schema extraction dynamically.


Interview Angle: 
● AI + DB integration = real-world impact 
● Security-conscious (blocked CREATE/INSERT/UPDATE) 
● Self-hosted on EC2 — shows DevOps exposure 
● Built end-to-end — frontend, backend, DB, and AI 


How to Present to Leaders or Managers 
Pitch to Company Leadership or Product Heads: 
"AI-Powered SQL is a GenAI-driven internal tool that simplifies access to relational databases 
using natural language. It bridges the gap between business users and technical data 
systems." 


Business Value: 
● Reduces dependency on data analysts for basic reports 
● Democratizes data access across departments 
● Increases speed to insight and self-service analytics 


Why It Matters: 
● Data is critical, but SQL is a barrier to many users 
● AI-Powered SQL opens up structured data through an intuitive interface 
● Safe — no write permissions, only SELECT, JOINs, filters, aggregations 


Key Talking Points for Leaders: 
● Built with production-ready stack (React, FastAPI, MySQL, OpenAI)
● Securely restricted queries prevent data corruption 
● Can scale with more tables or role-based query access 
● Easy to brand, extend, and deploy internally 


Vision: This could evolve into an internal chatbot for data access, integrated with Slack or 
Teams, or support multiple databases (PostgreSQL, Snowflake). With UI polish and role-based 
access, it can become a no-code BI tool. 


Data Security Concern Response: If leaders raise concerns around data privacy with cloud AI 
services like OpenAI, it's important to highlight that we already use cloud services like GitHub, 
managed cloud databases, and SaaS tools — all of which involve some level of data sharing 
and trust. OpenAI is yet another example of an "AI-as-a-Service" layer similar to how we 
consume "Data-as-a-Service" or "Platform-as-a-Service". We're not sending sensitive or PII data 
to the model, and the prompts are limited to controlled schema exposure. Moreover, we have 
strict table access and query constraints to ensure safety


How You Add Value:
● Shows initiative to blend AI and engineering 
● Aligns with the org’s goals around data accessibility and AI 
● Demonstrates real ownership and product mindset 

