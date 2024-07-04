control_plane = ControlPlaneServer(
    message_queue=queue_client,
    orchestrator=AgentOrchestrator(llm=OpenAI()),
    host=control_plane_host,
    port=int(control_plane_port) if control_plane_port else None,
)
