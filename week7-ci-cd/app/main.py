"""Simple web application for CI/CD demonstration."""

import json
import os
from typing import Dict, Any


class ConfigManager:
    """Configuration management with environment variable support."""
    
    def __init__(self):
        """Initialize configuration from environment variables."""
        self.debug = os.getenv("DEBUG", "False").lower() == "true"
        self.port = int(os.getenv("PORT", "8000"))
        self.api_key = os.getenv("API_KEY", "")
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            "debug": self.debug,
            "port": self.port,
            "environment": self.environment,
            "log_level": self.log_level,
            "has_api_key": bool(self.api_key),
        }
    
    def validate(self) -> bool:
        """Validate configuration."""
        if self.port < 1 or self.port > 65535:
            raise ValueError(f"Invalid port: {self.port}")
        
        if self.environment not in ["development", "staging", "production"]:
            raise ValueError(f"Invalid environment: {self.environment}")
        
        return True


class DataProcessor:
    """Data processing utilities."""
    
    @staticmethod
    def calculate_sum(numbers: list) -> int:
        """Calculate sum of numbers."""
        return sum(numbers)
    
    @staticmethod
    def calculate_average(numbers: list) -> float:
        """Calculate average of numbers."""
        if not numbers:
            return 0.0
        return sum(numbers) / len(numbers)
    
    @staticmethod
    def parse_json(data: str) -> Dict[str, Any]:
        """Parse JSON data."""
        return json.loads(data)
    
    @staticmethod
    def format_response(status: str, data: Any = None, error: str = None) -> Dict[str, Any]:
        """Format API response."""
        response = {"status": status}
        if data is not None:
            response["data"] = data
        if error is not None:
            response["error"] = error
        return response


class APIHandler:
    """API request handler."""
    
    def __init__(self, config: ConfigManager):
        """Initialize handler with configuration."""
        self.config = config
        self.processor = DataProcessor()
    
    def handle_request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle API request."""
        if not self._validate_request(endpoint, payload):
            return self.processor.format_response(
                "error",
                error="Invalid request"
            )
        
        if endpoint == "/sum":
            numbers = payload.get("numbers", [])
            result = self.processor.calculate_sum(numbers)
            return self.processor.format_response("success", data={"sum": result})
        
        elif endpoint == "/average":
            numbers = payload.get("numbers", [])
            result = self.processor.calculate_average(numbers)
            return self.processor.format_response("success", data={"average": result})
        
        elif endpoint == "/health":
            return self.processor.format_response("success", data=self.config.to_dict())
        
        else:
            return self.processor.format_response(
                "error",
                error=f"Unknown endpoint: {endpoint}"
            )
    
    def _validate_request(self, endpoint: str, payload: Dict[str, Any]) -> bool:
        """Validate API request."""
        valid_endpoints = ["/sum", "/average", "/health"]
        return endpoint in valid_endpoints


def create_app() -> Dict[str, Any]:
    """Create application instance with configuration."""
    config = ConfigManager()
    config.validate()
    
    return {
        "config": config,
        "processor": DataProcessor(),
        "handler": APIHandler(config),
    }


if __name__ == "__main__":
    app = create_app()
    print("Application initialized successfully")
    print(f"Configuration: {app['config'].to_dict()}")
