import os
import duckdb
import matplotlib.pyplot as plt
import io
import base64
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from datetime import datetime

class PDFService:
    def __init__(self, db_path='data/sheetbase.db'):
        self.db_path = db_path
        self.env = Environment(loader=FileSystemLoader('app/templates'))

    def _get_db_connection(self):
        return duckdb.connect(self.db_path)

    def generate_report(self, table_name: str):
        con = self._get_db_connection()
        try:
            # Fetch data for the report
            df = con.execute(f"SELECT * FROM {table_name} LIMIT 100").df()
            
            # Generate a simple chart (e.g., first numeric column)
            chart_base64 = self._generate_chart(df, table_name)
            
            # Prepare template data
            report_data = {
                "title": f"Report for {table_name.replace('_', ' ').capitalize()}",
                "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "table_name": table_name,
                "rows": df.to_dict('records'),
                "headers": df.columns.tolist(),
                "chart": chart_base64
            }

            # Render HTML from template
            template = self.env.get_template('report_template.html')
            html_out = template.render(report_data)

            # Generate PDF
            pdf_io = io.BytesIO()
            HTML(string=html_out).write_pdf(pdf_io)
            pdf_io.seek(0)
            
            return pdf_io
        finally:
            con.close()

    def _generate_chart(self, df, title):
        # Find the first numeric column for a simple bar chart
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) == 0:
            return None

        col = numeric_cols[0]
        plt.figure(figsize=(10, 5))
        df[col].head(10).plot(kind='bar', color='#3b82f6')
        plt.title(f"Distribution of {col}")
        plt.tight_layout()

        # Save plot to base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=300)
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')
