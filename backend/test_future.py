import sys
import os
sys.path.append('.')
from app.services.future_service import generate_future_chart
try:
    generate_future_chart("RELIANCE")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
