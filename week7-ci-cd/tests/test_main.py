"""Tests for main application."""

import json
import os
import pytest

from app.main import (
    ConfigManager,
    DataProcessor,
    APIHandler,
    create_app,
)


class TestConfigManager:
    """Test ConfigManager class."""
    
    def test_default_configuration(self, monkeypatch):
        """Test default configuration values."""
        # Clear environment variables
        monkeypatch.delenv("DEBUG", raising=False)
        monkeypatch.delenv("PORT", raising=False)
        monkeypatch.delenv("ENVIRONMENT", raising=False)
        
        config = ConfigManager()
        assert config.debug is False
        assert config.port == 8000
        assert config.environment == "development"
    
    def test_environment_variables(self, monkeypatch):
        """Test configuration from environment variables."""
        monkeypatch.setenv("DEBUG", "true")
        monkeypatch.setenv("PORT", "9000")
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("API_KEY", "secret-key")
        
        config = ConfigManager()
        assert config.debug is True
        assert config.port == 9000
        assert config.environment == "production"
        assert config.api_key == "secret-key"
    
    def test_config_to_dict(self):
        """Test configuration to dictionary conversion."""
        config = ConfigManager()
        config_dict = config.to_dict()
        
        assert "debug" in config_dict
        assert "port" in config_dict
        assert "environment" in config_dict
        assert "has_api_key" in config_dict
    
    def test_validate_invalid_port(self, monkeypatch):
        """Test validation with invalid port."""
        monkeypatch.setenv("PORT", "99999")
        
        config = ConfigManager()
        with pytest.raises(ValueError):
            config.validate()
    
    def test_validate_invalid_environment(self, monkeypatch):
        """Test validation with invalid environment."""
        monkeypatch.setenv("ENVIRONMENT", "invalid")
        
        config = ConfigManager()
        with pytest.raises(ValueError):
            config.validate()


class TestDataProcessor:
    """Test DataProcessor class."""
    
    def test_calculate_sum(self):
        """Test sum calculation."""
        assert DataProcessor.calculate_sum([1, 2, 3]) == 6
        assert DataProcessor.calculate_sum([]) == 0
        assert DataProcessor.calculate_sum([-1, -2, -3]) == -6
    
    def test_calculate_average(self):
        """Test average calculation."""
        assert DataProcessor.calculate_average([1, 2, 3]) == 2.0
        assert DataProcessor.calculate_average([]) == 0.0
        assert abs(DataProcessor.calculate_average([1, 2, 4]) - 2.333) < 0.01
    
    def test_parse_json(self):
        """Test JSON parsing."""
        json_str = '{"key": "value", "number": 42}'
        result = DataProcessor.parse_json(json_str)
        
        assert result["key"] == "value"
        assert result["number"] == 42
    
    def test_parse_json_invalid(self):
        """Test JSON parsing with invalid data."""
        with pytest.raises(json.JSONDecodeError):
            DataProcessor.parse_json("invalid json")
    
    def test_format_response_success(self):
        """Test response formatting for success."""
        response = DataProcessor.format_response("success", data={"result": 42})
        
        assert response["status"] == "success"
        assert response["data"]["result"] == 42
        assert "error" not in response
    
    def test_format_response_error(self):
        """Test response formatting for error."""
        response = DataProcessor.format_response("error", error="Something went wrong")
        
        assert response["status"] == "error"
        assert response["error"] == "Something went wrong"
        assert "data" not in response


class TestAPIHandler:
    """Test APIHandler class."""
    
    @pytest.fixture
    def handler(self):
        """Create API handler for testing."""
        config = ConfigManager()
        return APIHandler(config)
    
    def test_sum_endpoint(self, handler):
        """Test /sum endpoint."""
        response = handler.handle_request("/sum", {"numbers": [1, 2, 3, 4]})
        
        assert response["status"] == "success"
        assert response["data"]["sum"] == 10
    
    def test_average_endpoint(self, handler):
        """Test /average endpoint."""
        response = handler.handle_request("/average", {"numbers": [2, 4, 6]})
        
        assert response["status"] == "success"
        assert response["data"]["average"] == 4.0
    
    def test_health_endpoint(self, handler):
        """Test /health endpoint."""
        response = handler.handle_request("/health", {})
        
        assert response["status"] == "success"
        assert "data" in response
        assert "port" in response["data"]
    
    def test_unknown_endpoint(self, handler):
        """Test unknown endpoint."""
        response = handler.handle_request("/unknown", {})
        
        assert response["status"] == "error"
        assert "error" in response
    
    def test_empty_numbers_for_average(self, handler):
        """Test average with empty numbers."""
        response = handler.handle_request("/average", {"numbers": []})
        
        assert response["status"] == "success"
        assert response["data"]["average"] == 0.0


class TestAppCreation:
    """Test application creation."""
    
    def test_create_app(self):
        """Test app creation."""
        app = create_app()
        
        assert "config" in app
        assert "processor" in app
        assert "handler" in app
        assert isinstance(app["config"], ConfigManager)
        assert isinstance(app["processor"], DataProcessor)
        assert isinstance(app["handler"], APIHandler)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
