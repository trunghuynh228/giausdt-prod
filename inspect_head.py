import requests

url = 'https://dashboard2.holdstation.com/public/question/f8d68d7d-ce0c-4abc-bf4d-e50fa980d7dd.json'
try:
    response = requests.get(url)
    print(response.text[:500])
except Exception as e:
    print(e)
