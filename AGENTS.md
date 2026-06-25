# Normas del Proyecto - Capa Neuronal (Workspace Central)

## Comandos de EjecuciÃ³n Local
*   AnÃ¡lisis rÃ¡pido: `python .neural_bridge/bridge.py --task "[tarea]" --input [archivo]`
*   RefactorizaciÃ³n de cÃ³digo: `python .neural_bridge/bridge.py --task "[tarea]" --input [archivo] --output [archivo] --mode refactor`
*   Modo Forzado Flash: Agregar `--model gemini-2.5-flash` al final

## Protocolo de SincronizaciÃ³n Inter-Dispositivo (OneDrive)
*   **AL INICIAR LA SESIÃ“N:** Lea obligatoriamente `.neural_state.md` antes de tomar cualquier acciÃ³n para heredar el contexto inmediato de la Ãºltima sesiÃ³n.
*   **AL FINALIZAR LA SESIÃ“N:** Escriba el estado actual del proyecto, tareas pendientes y bloqueos en `.neural_state.md` para que el otro dispositivo retome fluidamente.