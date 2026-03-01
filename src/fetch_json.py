import json

def fetch_and_save():
    import urllib.request
    
    # We can fetch the raw "nubase2020.txt" or similar parsed JSON that exists on the open web.
    # An excellent source is the JSON compiled by "periodictable" or "mendeleev" community.
    # Let's write a self-contained script using `urllib` to get a curated JSON.
    
    url = "https://raw.githubusercontent.com/tlorimer/Isotopes/master/isotopes.json"
    
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            with open('isotopes.json', 'w') as f:
                json.dump(data, f)
            print("Successfully downloaded JSON.")
    except Exception as e:
        print(f"Failed: {e}")
        
fetch_and_save()
