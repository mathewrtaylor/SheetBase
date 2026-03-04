import os
import duckdb
import pandas as pd
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def get_google_sheets_service():
    api_key = os.getenv('GOOGLE_API_KEY')
    if api_key:
        print("Using Google API Key for authentication.")
        return build('sheets', 'v4', developerKey=api_key)

    creds = None
    # ... (existing OAuth2 logic remains for user-specific operations)
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                os.getenv('GOOGLE_CREDENTIALS_FILE', 'credentials.json'), SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('sheets', 'v4', credentials=creds)

def sanitize_column_name(name):
    """Sanitize column names for SQL."""
    return name.strip().lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')

def main():
    spreadsheet_id = os.getenv('GOOGLE_SHEETS_ID')
    db_path = os.getenv('DB_PATH', 'data/sheetbase.db')
    
    if not spreadsheet_id:
        print("Error: GOOGLE_SHEETS_ID not found in .env")
        return

    service = get_google_sheets_service()
    sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheets = sheet_metadata.get('sheets', '')

    # Connect to DuckDB
    con = duckdb.connect(db_path)

    for sheet in sheets:
        title = sheet.get("properties", {}).get("title")
        print(f"Ingesting sheet: {title}...")
        
        # Fetch data from sheet
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id, range=title).execute()
        values = result.get('values', [])

        if not values:
            print(f"No data found in {title}.")
            continue

        # Extract headers and data
        headers = [sanitize_column_name(h) for h in values[0]]
        data = values[1:]

        # Create DataFrame
        df = pd.DataFrame(data, columns=headers)
        
        # DuckDB can directly register a dataframe
        con.register('temp_df', df)
        
        # Create table in DuckDB (using the title sanitized)
        safe_title = sanitize_column_name(title)
        con.execute(f"CREATE OR REPLACE TABLE {safe_title} AS SELECT * FROM temp_df")
        
        print(f"Successfully loaded {len(df)} rows into table: {safe_title}")

    con.close()
    print("Ingestion complete!")

if __name__ == '__main__':
    main()
