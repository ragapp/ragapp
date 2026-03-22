"""Tests for MiniMax provider integration."""

import os
from unittest.mock import MagicMock, patch

import pytest

from backend.models.model_config import MiniMaxConfig, ModelConfig


class TestMiniMaxConfig:
    """Unit tests for MiniMaxConfig model."""

    def test_minimax_config_defaults(self):
        """MiniMaxConfig has correct default values."""
        config = MiniMaxConfig()
        assert config.minimax_api_key is None

    def test_minimax_config_with_api_key(self):
        """MiniMaxConfig correctly stores API key."""
        config = MiniMaxConfig(minimax_api_key="test-key-123")
        assert config.minimax_api_key == "test-key-123"

    def test_minimax_config_env_mapping(self):
        """MiniMaxConfig field has correct env var mapping."""
        field_info = MiniMaxConfig.model_fields["minimax_api_key"]
        assert field_info.json_schema_extra["env"] == "MINIMAX_API_KEY"


class TestModelConfigWithMiniMax:
    """Unit tests for ModelConfig with MiniMax provider."""

    def test_model_config_includes_minimax_fields(self):
        """ModelConfig includes minimax_api_key from MiniMaxConfig."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="test-key",
            model="MiniMax-M2.7",
        )
        assert config.minimax_api_key == "test-key"
        assert config.model_provider == "minimax"
        assert config.model == "MiniMax-M2.7"

    def test_minimax_configured_with_key(self):
        """ModelConfig.configured returns True when MiniMax API key is set."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="test-key",
        )
        assert config.configured is True

    def test_minimax_not_configured_without_key(self):
        """ModelConfig.configured returns False when MiniMax API key is missing."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key=None,
        )
        assert config.configured is False

    def test_minimax_does_not_conflict_with_openai(self):
        """MiniMax config does not interfere with OpenAI config fields."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="minimax-key",
            openai_api_key="openai-key",
        )
        assert config.minimax_api_key == "minimax-key"
        assert config.openai_api_key == "openai-key"

    def test_model_config_get_config(self):
        """ModelConfig.get_config() returns a valid ModelConfig instance."""
        config = ModelConfig.get_config()
        assert isinstance(config, ModelConfig)

    def test_minimax_config_with_all_model_fields(self):
        """ModelConfig with MiniMax includes all standard model fields."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="test-key",
            model="MiniMax-M2.7",
            embedding_model="all-MiniLM-L6-v2",
        )
        assert config.model == "MiniMax-M2.7"
        assert config.embedding_model == "all-MiniLM-L6-v2"

    def test_minimax_m27_highspeed_model(self):
        """ModelConfig correctly stores MiniMax-M2.7-highspeed model."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="test-key",
            model="MiniMax-M2.7-highspeed",
        )
        assert config.model == "MiniMax-M2.7-highspeed"

    def test_minimax_m25_model(self):
        """ModelConfig correctly stores MiniMax-M2.5 model."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="test-key",
            model="MiniMax-M2.5",
        )
        assert config.model == "MiniMax-M2.5"

    def test_minimax_m25_highspeed_model(self):
        """ModelConfig correctly stores MiniMax-M2.5-highspeed model."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key="test-key",
            model="MiniMax-M2.5-highspeed",
        )
        assert config.model == "MiniMax-M2.5-highspeed"


class TestMiniMaxMultiAgentSupport:
    """Tests for MiniMax in the multi-agent model check."""

    def test_minimax_supports_multi_agents(self):
        """MiniMax provider is recognized as supporting multi-agent mode."""
        from backend.controllers.agents import AgentManager

        # Clear the lru_cache to avoid stale results
        AgentManager.check_supported_multi_agents_model.cache_clear()
        result = AgentManager.check_supported_multi_agents_model("minimax", "MiniMax-M2.7")
        assert result is True

    def test_minimax_highspeed_supports_multi_agents(self):
        """MiniMax-M2.7-highspeed also supports multi-agent mode."""
        from backend.controllers.agents import AgentManager

        AgentManager.check_supported_multi_agents_model.cache_clear()
        result = AgentManager.check_supported_multi_agents_model("minimax", "MiniMax-M2.7-highspeed")
        assert result is True


class TestMiniMaxSettingsPatch:
    """Tests for the MiniMax init_minimax function in the settings patch."""

    def test_init_minimax_raises_without_api_key(self):
        """init_minimax raises ValueError when MINIMAX_API_KEY is not set."""
        # Import the patched settings module
        import importlib.util
        import sys

        settings_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "patch", "backend", "app", "settings.py"
        )
        settings_path = os.path.normpath(settings_path)

        spec = importlib.util.spec_from_file_location("patched_settings", settings_path)
        patched_settings = importlib.util.module_from_spec(spec)

        # Ensure MINIMAX_API_KEY is not set
        env = os.environ.copy()
        env.pop("MINIMAX_API_KEY", None)

        with patch.dict(os.environ, env, clear=True):
            spec.loader.exec_module(patched_settings)
            with pytest.raises(ValueError, match="MINIMAX_API_KEY"):
                patched_settings.init_minimax()

    def test_init_minimax_with_api_key(self):
        """init_minimax initializes OpenAILike LLM and FastEmbed embeddings."""
        import importlib.util

        settings_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "patch", "backend", "app", "settings.py"
        )
        settings_path = os.path.normpath(settings_path)

        spec = importlib.util.spec_from_file_location("patched_settings_2", settings_path)
        patched_settings = importlib.util.module_from_spec(spec)

        mock_openai_like = MagicMock()
        mock_fastembed = MagicMock()

        with patch.dict(os.environ, {
            "MINIMAX_API_KEY": "test-key-123",
            "MODEL": "MiniMax-M2.7",
            "EMBEDDING_MODEL": "all-MiniLM-L6-v2",
        }):
            with patch.dict("sys.modules", {
                "llama_index.llms.openai_like": MagicMock(OpenAILike=mock_openai_like),
                "llama_index.embeddings.fastembed": MagicMock(FastEmbedEmbedding=mock_fastembed),
                "llama_index.core.settings": MagicMock(),
                "llama_index.core.constants": MagicMock(DEFAULT_TEMPERATURE=0.1),
            }):
                spec.loader.exec_module(patched_settings)
                patched_settings.init_minimax()

                # Verify OpenAILike was called with correct params
                mock_openai_like.assert_called_once()
                call_kwargs = mock_openai_like.call_args
                assert call_kwargs.kwargs["model"] == "MiniMax-M2.7"
                assert call_kwargs.kwargs["api_key"] == "test-key-123"
                assert call_kwargs.kwargs["api_base"] == "https://api.minimax.io/v1"
                assert call_kwargs.kwargs["is_chat_model"] is True
                assert call_kwargs.kwargs["is_function_calling_model"] is True

    def test_settings_dispatch_includes_minimax(self):
        """init_settings dispatches 'minimax' model_provider to init_minimax."""
        import importlib.util

        settings_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "patch", "backend", "app", "settings.py"
        )
        settings_path = os.path.normpath(settings_path)

        spec = importlib.util.spec_from_file_location("patched_settings_3", settings_path)
        patched_settings = importlib.util.module_from_spec(spec)

        with patch.dict(os.environ, {"MODEL_PROVIDER": "minimax"}):
            with patch.dict("sys.modules", {
                "llama_index.core.settings": MagicMock(),
                "llama_index.core.constants": MagicMock(DEFAULT_TEMPERATURE=0.1),
            }):
                spec.loader.exec_module(patched_settings)

                with patch.object(patched_settings, "init_minimax") as mock_init:
                    patched_settings.init_settings()
                    mock_init.assert_called_once()


class TestMiniMaxTemperatureClamping:
    """Tests for MiniMax temperature clamping behavior."""

    def test_temperature_clamped_to_min(self):
        """Temperature below 0.01 is clamped to 0.01."""
        import importlib.util

        settings_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "patch", "backend", "app", "settings.py"
        )
        settings_path = os.path.normpath(settings_path)

        spec = importlib.util.spec_from_file_location("patched_settings_4", settings_path)
        patched_settings = importlib.util.module_from_spec(spec)

        mock_openai_like = MagicMock()
        mock_fastembed = MagicMock()

        with patch.dict(os.environ, {
            "MINIMAX_API_KEY": "test-key",
            "MODEL": "MiniMax-M2.7",
            "EMBEDDING_MODEL": "all-MiniLM-L6-v2",
            "LLM_TEMPERATURE": "0.0",
        }):
            with patch.dict("sys.modules", {
                "llama_index.llms.openai_like": MagicMock(OpenAILike=mock_openai_like),
                "llama_index.embeddings.fastembed": MagicMock(FastEmbedEmbedding=mock_fastembed),
                "llama_index.core.settings": MagicMock(),
                "llama_index.core.constants": MagicMock(DEFAULT_TEMPERATURE=0.1),
            }):
                spec.loader.exec_module(patched_settings)
                patched_settings.init_minimax()

                call_kwargs = mock_openai_like.call_args
                assert call_kwargs.kwargs["temperature"] == 0.01

    def test_temperature_clamped_to_max(self):
        """Temperature above 1.0 is clamped to 1.0."""
        import importlib.util

        settings_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "patch", "backend", "app", "settings.py"
        )
        settings_path = os.path.normpath(settings_path)

        spec = importlib.util.spec_from_file_location("patched_settings_5", settings_path)
        patched_settings = importlib.util.module_from_spec(spec)

        mock_openai_like = MagicMock()
        mock_fastembed = MagicMock()

        with patch.dict(os.environ, {
            "MINIMAX_API_KEY": "test-key",
            "MODEL": "MiniMax-M2.7",
            "EMBEDDING_MODEL": "all-MiniLM-L6-v2",
            "LLM_TEMPERATURE": "2.0",
        }):
            with patch.dict("sys.modules", {
                "llama_index.llms.openai_like": MagicMock(OpenAILike=mock_openai_like),
                "llama_index.embeddings.fastembed": MagicMock(FastEmbedEmbedding=mock_fastembed),
                "llama_index.core.settings": MagicMock(),
                "llama_index.core.constants": MagicMock(DEFAULT_TEMPERATURE=0.1),
            }):
                spec.loader.exec_module(patched_settings)
                patched_settings.init_minimax()

                call_kwargs = mock_openai_like.call_args
                assert call_kwargs.kwargs["temperature"] == 1.0


class TestMiniMaxIntegration:
    """Integration tests for MiniMax provider (require MINIMAX_API_KEY)."""

    @pytest.fixture
    def minimax_api_key(self):
        key = os.getenv("MINIMAX_API_KEY")
        if not key:
            pytest.skip("MINIMAX_API_KEY not set, skipping integration test")
        return key

    def test_minimax_model_config_roundtrip(self, minimax_api_key):
        """ModelConfig with MiniMax provider can be created and serialized."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key=minimax_api_key,
            model="MiniMax-M2.7",
            embedding_model="all-MiniLM-L6-v2",
        )
        assert config.configured is True
        api_response = config.to_api_response()
        assert api_response["model_provider"] == "minimax"
        assert api_response["model"] == "MiniMax-M2.7"
        assert api_response["minimax_api_key"] == minimax_api_key

    def test_minimax_env_roundtrip(self, minimax_api_key):
        """MiniMax config env vars can be set and read correctly."""
        config = ModelConfig(
            model_provider="minimax",
            minimax_api_key=minimax_api_key,
            model="MiniMax-M2.7",
            embedding_model="all-MiniLM-L6-v2",
        )
        # Verify to_runtime_env sets correct env vars
        original_env = os.environ.copy()
        try:
            config.to_runtime_env()
            assert os.environ.get("MODEL_PROVIDER") == "minimax"
            assert os.environ.get("MINIMAX_API_KEY") == minimax_api_key
            assert os.environ.get("MODEL") == "MiniMax-M2.7"
        finally:
            # Restore original environment
            os.environ.clear()
            os.environ.update(original_env)

    def test_minimax_openai_like_llm_creation(self, minimax_api_key):
        """OpenAILike LLM can be created with MiniMax API credentials."""
        try:
            from llama_index.llms.openai_like import OpenAILike
        except ImportError:
            pytest.skip("llama-index-llms-openai-like not installed")

        llm = OpenAILike(
            model="MiniMax-M2.7",
            api_key=minimax_api_key,
            api_base="https://api.minimax.io/v1",
            is_chat_model=True,
            is_function_calling_model=True,
        )
        assert llm.model == "MiniMax-M2.7"
