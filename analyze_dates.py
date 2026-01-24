import requests
import json
from datetime import datetime

url = 'https://dashboard2.holdstation.com/public/question/f8d68d7d-ce0c-4abc-bf4d-e50fa980d7dd.json'

try:
    response = requests.get(url)
    data = response.json()
    
    dates = []
    for item in data:
        # Format: "December 25, 2025"
        # We need to handle this specific format
        try:
            d = datetime.strptime(item['order_date'], '%B %d, %Y')
            dates.append(d)
        except Exception as e:
            print(f"Error parsing date: {item['order_date']} - {e}")

    if dates:
        dates.sort()
        print(f"Total records: {len(dates)}")
        print(f"Earliest date: {dates[0]}")
        print(f"Latest date: {dates[-1]}")
    else:
        print("No valid dates found")

except Exception as e:
    print(f"Error: {e}")
