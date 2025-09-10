import time
import json
import requests
import schedule
import threading
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify
import os

app = Flask(__name__)

# Monitoring configuration
MONITORING_TARGETS = [
    {
        'name': 'WordPress Site',
        'url': 'https://nginx:443',
        'expected_status': 200,
        'timeout': 10
    },
    {
        'name': 'Adminer',
        'url': 'http://adminer:8080',
        'expected_status': 200,
        'timeout': 5
    },
    {
        'name': 'Static Website',
        'url': 'http://static_website:9999',
        'expected_status': 200,
        'timeout': 5
    }
]

# Storage for monitoring data
monitoring_data = {
    'checks': [],
    'summary': {},
    'alerts': []
}

DATA_FILE = '/app/data/monitoring.json'

def load_data():
    """Load monitoring data from file"""
    global monitoring_data
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                monitoring_data = json.load(f)
    except Exception as e:
        print(f"Error loading data: {e}")

def save_data():
    """Save monitoring data to file"""
    try:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w') as f:
            json.dump(monitoring_data, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")

def check_website(target):
    """Check a single website target"""
    start_time = time.time()
    result = {
        'timestamp': datetime.now().isoformat(),
        'name': target['name'],
        'url': target['url'],
        'status': 'down',
        'response_time': 0,
        'status_code': 0,
        'error': None
    }
    
    try:
        # Disable SSL verification for internal services
        response = requests.get(
            target['url'], 
            timeout=target['timeout'],
            verify=False,
            allow_redirects=True
        )
        
        result['response_time'] = round((time.time() - start_time) * 1000, 2)  # ms
        result['status_code'] = response.status_code
        
        if response.status_code == target['expected_status']:
            result['status'] = 'up'
        else:
            result['status'] = 'warning'
            result['error'] = f"Unexpected status code: {response.status_code}"
            
    except requests.exceptions.Timeout:
        result['error'] = "Request timeout"
        result['response_time'] = target['timeout'] * 1000
    except requests.exceptions.ConnectionError:
        result['error'] = "Connection error"
    except Exception as e:
        result['error'] = str(e)
    
    return result

def monitor_all_targets():
    """Monitor all configured targets"""
    print(f"Running monitoring check at {datetime.now()}")
    
    for target in MONITORING_TARGETS:
        result = check_website(target)
        
        # Add to monitoring data
        monitoring_data['checks'].append(result)
        
        # Keep only last 1000 checks
        if len(monitoring_data['checks']) > 1000:
            monitoring_data['checks'] = monitoring_data['checks'][-1000:]
        
        # Update summary
        if target['name'] not in monitoring_data['summary']:
            monitoring_data['summary'][target['name']] = {
                'total_checks': 0,
                'up_count': 0,
                'down_count': 0,
                'avg_response_time': 0,
                'last_check': None,
                'uptime_percentage': 0
            }
        
        summary = monitoring_data['summary'][target['name']]
        summary['total_checks'] += 1
        summary['last_check'] = result
        
        if result['status'] == 'up':
            summary['up_count'] += 1
        else:
            summary['down_count'] += 1
            
            # Add alert for down services
            alert = {
                'timestamp': result['timestamp'],
                'service': target['name'],
                'message': f"Service {target['name']} is {result['status']}: {result['error'] or 'Unknown error'}",
                'severity': 'critical' if result['status'] == 'down' else 'warning'
            }
            monitoring_data['alerts'].append(alert)
            
            # Keep only last 100 alerts
            if len(monitoring_data['alerts']) > 100:
                monitoring_data['alerts'] = monitoring_data['alerts'][-100:]
        
        # Calculate uptime percentage
        if summary['total_checks'] > 0:
            summary['uptime_percentage'] = round(
                (summary['up_count'] / summary['total_checks']) * 100, 2
            )
        
        # Calculate average response time
        recent_checks = [
            check for check in monitoring_data['checks'][-20:] 
            if check['name'] == target['name'] and check['status'] == 'up'
        ]
        if recent_checks:
            summary['avg_response_time'] = round(
                sum(check['response_time'] for check in recent_checks) / len(recent_checks), 2
            )
    
    save_data()

@app.route('/')
def dashboard():
    """Main monitoring dashboard"""
    return render_template('dashboard.html')

@app.route('/api/status')
def api_status():
    """API endpoint for current status"""
    return jsonify({
        'summary': monitoring_data['summary'],
        'recent_checks': monitoring_data['checks'][-50:],  # Last 50 checks
        'alerts': monitoring_data['alerts'][-20:],  # Last 20 alerts
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health')
def api_health():
    """Health check endpoint for the monitor itself"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'monitoring_targets': len(MONITORING_TARGETS),
        'total_checks': len(monitoring_data['checks'])
    })

def run_scheduler():
    """Run the monitoring scheduler in a separate thread"""
    schedule.every(30).seconds.do(monitor_all_targets)  # Check every 30 seconds
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    print("Starting Website Monitor Service")
    
    # Load existing data
    load_data()
    
    # Start monitoring scheduler in background
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    # Run initial check
    monitor_all_targets()
    
    # Start Flask web server
    app.run(host='0.0.0.0', port=5000, debug=False)
