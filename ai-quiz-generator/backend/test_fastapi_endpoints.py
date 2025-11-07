"""
Test FastAPI endpoints
Comprehensive testing of all API endpoints
"""
import json
import requests
import time
from datetime import datetime
from models import QuizOutput

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Python_(programming_language)"

def test_health_endpoints():
    """Test health check endpoints"""
    print("🔍 Testing Health Endpoints...")
    
    try:
        # Test root endpoint
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✅ Root endpoint working")
        
        # Test health endpoint
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        health_data = response.json()
        assert "status" in health_data
        print("✅ Health endpoint working")
        
        # Test stats endpoint
        response = requests.get(f"{BASE_URL}/stats")
        assert response.status_code == 200
        stats_data = response.json()
        assert "total_quizzes" in stats_data
        print("✅ Stats endpoint working")
        
        return True
        
    except Exception as e:
        print(f"❌ Health endpoints test failed: {e}")
        return False

def test_generate_quiz_endpoint():
    """Test /generate_quiz POST endpoint"""
    print("\n🔍 Testing /generate_quiz Endpoint...")
    
    try:
        # Prepare request data
        request_data = {
            "url": TEST_WIKIPEDIA_URL
        }
        
        print(f"📤 Sending request to generate quiz for: {TEST_WIKIPEDIA_URL}")
        
        # Make POST request
        response = requests.post(
            f"{BASE_URL}/generate_quiz",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print(f"❌ Request failed with status {response.status_code}: {response.text}")
            return False, None
        
        # Parse response
        quiz_data = response.json()
        
        # Validate response structure
        required_fields = ["id", "url", "title", "date_generated", "summary", "key_entities", "sections", "quiz", "related_topics"]
        for field in required_fields:
            assert field in quiz_data, f"Missing field: {field}"
        
        # Validate quiz structure matches document requirements
        assert quiz_data["url"] == TEST_WIKIPEDIA_URL
        assert isinstance(quiz_data["id"], int)
        assert isinstance(quiz_data["quiz"], list)
        assert 5 <= len(quiz_data["quiz"]) <= 10, f"Quiz should have 5-10 questions, got {len(quiz_data['quiz'])}"
        
        # Validate individual questions
        for i, question in enumerate(quiz_data["quiz"]):
            assert "question" in question, f"Question {i} missing 'question' field"
            assert "options" in question, f"Question {i} missing 'options' field"
            assert "answer" in question, f"Question {i} missing 'answer' field"
            assert "difficulty" in question, f"Question {i} missing 'difficulty' field"
            assert "explanation" in question, f"Question {i} missing 'explanation' field"
            assert len(question["options"]) == 4, f"Question {i} should have 4 options"
            assert question["difficulty"] in ["easy", "medium", "hard"], f"Invalid difficulty: {question['difficulty']}"
        
        # Validate key entities structure
        assert "people" in quiz_data["key_entities"]
        assert "organizations" in quiz_data["key_entities"]
        assert "locations" in quiz_data["key_entities"]
        
        print(f"✅ Quiz generated successfully!")
        print(f"📊 Quiz ID: {quiz_data['id']}")
        print(f"📝 Title: {quiz_data['title']}")
        print(f"🎯 Questions: {len(quiz_data['quiz'])}")
        print(f"📅 Generated: {quiz_data['date_generated']}")
        
        return True, quiz_data["id"]
        
    except Exception as e:
        print(f"❌ Generate quiz test failed: {e}")
        return False, None

def test_history_endpoint():
    """Test /history GET endpoint"""
    print("\n🔍 Testing /history Endpoint...")
    
    try:
        # Make GET request
        response = requests.get(f"{BASE_URL}/history")
        
        if response.status_code != 200:
            print(f"❌ Request failed with status {response.status_code}: {response.text}")
            return False
        
        # Parse response
        history_data = response.json()
        
        # Validate response structure
        assert isinstance(history_data, list), "History should be a list"
        
        if len(history_data) > 0:
            # Validate first item structure
            first_item = history_data[0]
            required_fields = ["id", "url", "title", "date_generated"]
            for field in required_fields:
                assert field in first_item, f"Missing field in history item: {field}"
            
            print(f"✅ History retrieved successfully!")
            print(f"📊 Total quizzes in history: {len(history_data)}")
            
            # Show recent quizzes
            for i, quiz in enumerate(history_data[:3]):  # Show first 3
                print(f"   {i+1}. ID: {quiz['id']}, Title: {quiz['title'][:50]}...")
        else:
            print("✅ History endpoint working (no quizzes yet)")
        
        return True
        
    except Exception as e:
        print(f"❌ History test failed: {e}")
        return False

def test_quiz_detail_endpoint(quiz_id):
    """Test /quiz/{quiz_id} GET endpoint"""
    print(f"\n🔍 Testing /quiz/{quiz_id} Endpoint...")
    
    try:
        # Make GET request
        response = requests.get(f"{BASE_URL}/quiz/{quiz_id}")
        
        if response.status_code != 200:
            print(f"❌ Request failed with status {response.status_code}: {response.text}")
            return False
        
        # Parse response
        quiz_data = response.json()
        
        # Validate response structure (should be same as generate_quiz response)
        required_fields = ["id", "url", "title", "date_generated", "summary", "key_entities", "sections", "quiz", "related_topics"]
        for field in required_fields:
            assert field in quiz_data, f"Missing field: {field}"
        
        # Validate that this is the correct quiz
        assert quiz_data["id"] == quiz_id, f"Expected quiz ID {quiz_id}, got {quiz_data['id']}"
        
        # Validate quiz structure
        assert isinstance(quiz_data["quiz"], list)
        assert len(quiz_data["quiz"]) >= 5, "Quiz should have at least 5 questions"
        
        # Validate that full_quiz_data was properly deserialized
        for question in quiz_data["quiz"]:
            assert isinstance(question, dict), "Each question should be a dictionary"
            assert "question" in question
            assert "options" in question
            assert len(question["options"]) == 4
        
        print(f"✅ Quiz detail retrieved successfully!")
        print(f"📊 Quiz ID: {quiz_data['id']}")
        print(f"📝 Title: {quiz_data['title']}")
        print(f"🎯 Questions: {len(quiz_data['quiz'])}")
        print(f"📋 Summary: {quiz_data['summary'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Quiz detail test failed: {e}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n🔍 Testing Error Handling...")
    
    try:
        # Test invalid Wikipedia URL
        invalid_request = {"url": "https://invalid-url.com"}
        response = requests.post(f"{BASE_URL}/generate_quiz", json=invalid_request)
        assert response.status_code == 400, "Should return 400 for invalid URL"
        print("✅ Invalid URL properly rejected")
        
        # Test non-existent quiz ID
        response = requests.get(f"{BASE_URL}/quiz/99999")
        assert response.status_code == 404, "Should return 404 for non-existent quiz"
        print("✅ Non-existent quiz ID properly handled")
        
        # Test malformed request
        response = requests.post(f"{BASE_URL}/generate_quiz", json={})
        assert response.status_code == 422, "Should return 422 for missing required fields"
        print("✅ Malformed request properly rejected")
        
        return True
        
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False

def run_full_api_test():
    """Run complete API test suite"""
    print("🚀 Starting FastAPI Endpoints Test Suite\n")
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code != 200:
            print("❌ FastAPI server is not running or not responding")
            print("💡 Please start the server with: uvicorn main:app --reload")
            return
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to FastAPI server")
        print("💡 Please start the server with: uvicorn main:app --reload")
        return
    
    print("✅ FastAPI server is running\n")
    
    # Run tests
    tests = []
    
    # Test 1: Health endpoints
    tests.append(test_health_endpoints())
    
    # Test 2: Generate quiz (this might take a while due to LLM)
    success, quiz_id = test_generate_quiz_endpoint()
    tests.append(success)
    
    # Test 3: History endpoint
    tests.append(test_history_endpoint())
    
    # Test 4: Quiz detail endpoint (only if we have a quiz ID)
    if quiz_id:
        tests.append(test_quiz_detail_endpoint(quiz_id))
    
    # Test 5: Error handling
    tests.append(test_error_handling())
    
    # Summary
    passed = sum(tests)
    total = len(tests)
    
    print(f"\n📊 API Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All FastAPI endpoint tests passed!")
        print("🎉 Phase 2 Step 5 implementation is working correctly!")
    else:
        print("❌ Some API tests failed. Please check the output above.")

if __name__ == "__main__":
    run_full_api_test()