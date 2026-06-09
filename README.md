<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>OBD-II Diagnostic Tool Pro - Comandos ELM327</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #eee;
            min-height: 100vh;
        }

        .header {
            background: linear-gradient(90deg, #0f3460, #1a1a2e);
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #e94560;
        }

        .header h1 { font-size: 1.8rem; margin-bottom: 5px; }
        .header p { color: #e94560; font-size: 0.9rem; }

        .connection-bar {
            background: #0f3460;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            border-bottom: 1px solid #2a2a4a;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }

        .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0,0,0,0.3);
            padding: 5px 12px;
            border-radius: 20px;
        }

        .led {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #555;
            transition: all 0.3s ease;
        }

        .led.connected { background: #00ff88; box-shadow: 0 0 10px #00ff88; animation: pulse 1.5s infinite; }
        .led.bluetooth { background: #0088ff; box-shadow: 0 0 10px #0088ff; }
        .led.searching { background: #ffaa00; box-shadow: 0 0 10px #ffaa00; animation: pulse 0.5s infinite; }
        .led.demo { background: #aa55ff; box-shadow: 0 0 10px #aa55ff; animation: pulse 2s infinite; }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .btn {
            background: #e94560;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            margin: 3px;
        }

        .btn:hover { background: #ff6b8a; transform: scale(1.02); }
        .btn-secondary { background: #2a2a4a; }
        .btn-secondary:hover { background: #3a3a5a; }
        .btn-danger { background: #ff4444; }
        .btn-success { background: #00aa55; }
        .btn-warning { background: #ffaa00; color: #1a1a2e; }

        .diagnostic-panel {
            background: #0f0f1a;
            border-radius: 10px;
            padding: 15px;
            margin-top: 15px;
            border: 1px solid #e94560;
        }

        .diagnostic-step {
            padding: 10px;
            margin: 5px 0;
            background: rgba(233, 69, 96, 0.1);
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.85rem;
        }

        .diagnostic-step.pass { border-left: 3px solid #00ff88; }
        .diagnostic-step.fail { border-left: 3px solid #ff4444; }
        .diagnostic-step.warning { border-left: 3px solid #ffaa00; }

        .container { display: flex; min-height: calc(100vh - 120px); }
        .sidebar {
            width: 280px;
            background: rgba(26, 26, 46, 0.95);
            border-right: 1px solid #2a2a4a;
            padding: 20px;
            overflow-y: auto;
        }

        .sidebar h3 { color: #e94560; margin-bottom: 15px; border-left: 3px solid #e94560; padding-left: 10px; }
        
        .menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            margin: 8px 0;
            background: #0f0f1a;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;
        }

        .menu-item:hover { background: #1a1a3a; border-color: #e94560; transform: translateX(5px); }
        .menu-item.active { background: #e94560; color: white; }

        .main-content { flex: 1; padding: 20px; overflow-y: auto; }
        .page { display: none; animation: fadeIn 0.3s ease; }
        .page.active { display: block; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .gauge-card {
            background: rgba(15, 15, 26, 0.8);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(233, 69, 96, 0.3);
        }

        .gauge-value { font-size: 2.5rem; font-weight: bold; margin: 10px 0; }
        .gauge-unit { font-size: 0.9rem; color: #888; }
        .gauge-bar { width: 100%; height: 8px; background: #2a2a4a; border-radius: 4px; overflow: hidden; margin-top: 10px; }
        .gauge-fill { height: 100%; background: linear-gradient(90deg, #00ff88, #e94560); border-radius: 4px; transition: width 0.3s ease; }

        .alerts-panel {
            background: #0f0f1a;
            border-radius: 15px;
            padding: 15px;
            margin-top: 20px;
            max-height: 200px;
            overflow-y: auto;
        }

        .alert-item {
            padding: 10px;
            margin: 5px 0;
            border-radius: 8px;
            background: rgba(233, 69, 96, 0.1);
            border-left: 3px solid #e94560;
        }

        .alert-critical { background: rgba(233, 69, 96, 0.2); border-left-color: #ff0000; }

        input, select {
            background: #0f0f1a;
            border: 1px solid #2a2a4a;
            padding: 10px;
            border-radius: 8px;
            color: white;
            width: 100%;
            margin: 5px 0;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .data-table th, .data-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #2a2a4a;
        }

        .data-table th { color: #e94560; }

        .progress-container { margin: 10px 0; }
        .progress-label { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .progress-bar { height: 8px; background: #2a2a4a; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00ff88, #e94560); border-radius: 4px; transition: width 0.3s ease; }

        .maintenance-item {
            background: #0f0f1a;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background: #1a1a2e;
            border-radius: 15px;
            padding: 25px;
            max-width: 600px;
            width: 90%;
            max-height: 85vh;
            overflow-y: auto;
        }

        .console-log {
            background: #0a0a0f;
            border-radius: 8px;
            padding: 10px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.8rem;
            max-height: 180px;
            overflow-y: auto;
            margin-top: 15px;
        }

        .log-entry { color: #00ff88; margin: 2px 0; border-bottom: 1px solid #1a1a2e; padding: 4px; }
        .log-error { color: #ff4444; }
        .log-info { color: #ffaa00; }
        .log-success { color: #00ff88; }

        .cmd-tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 15px;
            border-bottom: 2px solid #2a2a4a;
            flex-wrap: wrap;
        }

        .cmd-tab {
            padding: 10px 20px;
            background: #0f0f1a;
            border: none;
            border-radius: 10px 10px 0 0;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            color: #888;
        }

        .cmd-tab:hover {
            background: #1a1a3a;
            color: #fff;
        }

        .cmd-tab.active {
            background: #e94560;
            color: white;
        }

        .cmd-panel {
            display: none;
            background: #0f0f1a;
            border-radius: 0 10px 10px 10px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .cmd-panel.active {
            display: block;
        }

        .cmd-horizontal-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: flex-start;
        }

        .cmd-card-h {
            background: #1a1a2e;
            border: 1px solid #2a2a4a;
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
            text-align: center;
        }

        .cmd-card-h:hover {
            border-color: #e94560;
            transform: translateY(-2px);
            background: #e94560;
        }

        .cmd-code-h {
            font-family: monospace;
            font-size: 1rem;
            font-weight: bold;
            color: #e94560;
        }

        .cmd-card-h:hover .cmd-code-h {
            color: white;
        }

        .cmd-desc-h {
            font-size: 0.7rem;
            color: #888;
            margin-top: 4px;
        }

        .input-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .input-group input {
            flex: 1;
        }

        .brand-group {
            margin-bottom: 15px;
            border: 1px solid #2a2a4a;
            border-radius: 10px;
            overflow: hidden;
        }

        .brand-header {
            background: #e94560;
            padding: 12px 15px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1.1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .brand-header:hover {
            background: #ff6b8a;
        }

        .models-list {
            display: none;
            padding: 12px;
            background: #0f0f1a;
            flex-wrap: wrap;
            gap: 8px;
        }

        .models-list.show {
            display: flex;
            flex-wrap: wrap;
        }

        .model-chip {
            background: #2a2a4a;
            padding: 8px 16px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s ease;
            display: inline-block;
        }

        .model-chip:hover {
            background: #e94560;
            transform: scale(1.05);
        }

        .search-box {
            margin-bottom: 15px;
        }

        .search-box input {
            width: 100%;
            padding: 12px;
            border-radius: 25px;
            background: #0f0f1a;
            border: 1px solid #e94560;
            color: white;
            font-size: 1rem;
        }

        @media (max-width: 768px) {
            .container { flex-direction: column; }
            .sidebar { width: 100%; display: flex; overflow-x: auto; padding: 10px; }
            .menu-item { display: inline-flex; margin: 0 5px; }
            .cmd-tabs { justify-content: center; }
            .cmd-card-h { min-width: 80px; }
            .model-chip { padding: 6px 12px; font-size: 0.75rem; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚗 OBD-II Diagnostic Tool Pro - Chile</h1>
        <p>Diagnóstico avanzado | +60 Marcas | Comandos ELM327 organizados por tipo</p>
    </div>

    <div class="connection-bar">
        <div class="status-indicator">
            <div class="status-item"><div class="led" id="obdLed"></div><span id="obdStatus">Desconectado</span></div>
            <div class="status-item"><div class="led bluetooth" id="btLed"></div><span id="btStatus">Bluetooth: Desconectado</span></div>
            <div class="status-item"><div class="led" id="deviceLed"></div><span id="deviceName">Sin dispositivo</span></div>
        </div>
        <div class="vehicle-info" id="vehicleInfo">🚙 Sin vehículo seleccionado</div>
        <div>
            <button class="btn btn-secondary" onclick="showVehicleModal()">🚙 Seleccionar Vehículo</button>
            <button class="btn" id="connectBtn" onclick="connectBluetooth()">🔍 Conectar Bluetooth</button>
            <button class="btn btn-warning" id="diagnosticBtn" onclick="runDiagnostic()">🔧 Diagnóstico</button>
            <button class="btn btn-danger" id="disconnectBtn" onclick="disconnectBluetooth()" style="display:none">❌ Desconectar</button>
            <button class="btn btn-secondary" id="demoBtn" onclick="enableDemoMode()">🎮 Modo Demo</button>
        </div>
    </div>

    <div class="container">
        <div class="sidebar">
            <h3>📋 Menú Principal</h3>
            <div class="menu-item active" data-page="dashboard"><span>📊</span><span>Dashboard</span></div>
            <div class="menu-item" data-page="dtc"><span>🔍</span><span>Códigos DTC</span></div>
            <div class="menu-item" data-page="performance"><span>🏁</span><span>Rendimiento</span></div>
            <div class="menu-item" data-page="datalogger"><span>📝</span><span>Data Logger</span></div>
            <div class="menu-item" data-page="maintenance"><span>🔧</span><span>Mantenimiento</span></div>
            <div class="menu-item" data-page="driving"><span>🎯</span><span>Análisis Conducción</span></div>
            <div class="menu-item" data-page="ecu"><span>💻</span><span>Monitoreo ECU</span></div>
            <div class="menu-item" data-page="alerts"><span>⚠️</span><span>Alertas</span></div>
            <div class="menu-item" data-page="diagnostic"><span>🔬</span><span>Diagnóstico</span></div>
            <div class="menu-item" data-page="console"><span>📟</span><span>Consola OBD</span></div>
        </div>

        <div class="main-content">
            <div id="dashboard" class="page active">
                <h2>📊 Dashboard en Tiempo Real</h2>
                <div class="dashboard-grid" id="dashboardGrid"></div>
                <div class="alerts-panel"><h3>⚠️ Alertas Activas</h3><div id="activeAlerts"></div></div>
            </div>

            <div id="dtc" class="page">
                <h2>🔍 Códigos de Falla (DTC)</h2>
                <button class="btn" onclick="readDTC()">📖 Leer Códigos</button>
                <button class="btn btn-danger" onclick="clearDTC()">🗑️ Borrar Códigos</button>
                <div id="dtcList"></div>
            </div>

            <div id="performance" class="page">
                <h2>🏁 Pruebas de Rendimiento</h2>
                <button class="btn" onclick="startPerformanceTest('0-100')">🏎️ 0-100 km/h</button>
                <button class="btn" onclick="startPerformanceTest('quarter')">🏁 1/4 de Milla</button>
                <div id="performanceResult"></div>
            </div>

            <div id="datalogger" class="page">
                <h2>📝 Registro de Datos</h2>
                <button class="btn" onclick="startDataLogging()">▶️ Iniciar Registro</button>
                <button class="btn btn-secondary" onclick="stopDataLogging()">⏹️ Detener</button>
                <div id="loggingStatus"></div>
            </div>

            <div id="maintenance" class="page">
                <h2>🔧 Mantenimiento Programado</h2>
                <input type="number" id="currentKm" placeholder="Kilometraje actual">
                <button class="btn" onclick="showMaintenanceStatus()">Ver Estado</button>
                <div id="maintenanceStatus"></div>
            </div>

            <div id="driving" class="page">
                <h2>🎯 Análisis de Conducción</h2>
                <button class="btn" onclick="startDrivingAnalysis()">Iniciar Análisis (60s)</button>
                <div id="drivingResult"></div>
            </div>

            <div id="ecu" class="page">
                <h2>💻 Monitoreo de ECU</h2>
                <button class="btn" onclick="readECUInfo()">Leer Información ECU</button>
                <div id="ecuInfo"></div>
            </div>

            <div id="alerts" class="page">
                <h2>⚙️ Configuración de Alertas</h2>
                <div id="alertConfig"></div>
                <button class="btn" onclick="saveAlertConfig()">Guardar Configuración</button>
            </div>

            <div id="diagnostic" class="page">
                <h2>🔬 Diagnóstico de Conexión Bluetooth</h2>
                <div class="diagnostic-panel" id="diagnosticResults">
                    <p>Presione "Iniciar Diagnóstico" para verificar su sistema</p>
                </div>
                <button class="btn" onclick="runDiagnostic()">🔍 Iniciar Diagnóstico</button>
                <button class="btn btn-secondary" onclick="clearDiagnostic()">🗑️ Limpiar</button>
            </div>

            <div id="console" class="page">
                <h2>📟 Consola OBD-II Interactiva</h2>
                
                <div class="cmd-tabs" id="cmdTabs"></div>
                <div id="cmdPanels"></div>
                
                <div class="input-group">
                    <input type="text" id="commandInput" placeholder="Escriba un comando (ej: 010D, ATZ, 010C)" list="commandHistory">
                    <datalist id="commandHistory"></datalist>
                    <button class="btn" onclick="sendRawCommand()">📤 Enviar</button>
                    <button class="btn btn-secondary" onclick="clearConsole()">🗑️ Limpiar</button>
                </div>
                
                <div class="console-log" id="consoleLog">
                    <div class="log-entry">📟 Consola OBD-II lista</div>
                    <div class="log-entry">💡 Haga clic en cualquier comando para usarlo</div>
                    <div class="log-entry">🔌 Conecte un dispositivo Bluetooth para comenzar</div>
                </div>
            </div>
        </div>
    </div>

    <div id="vehicleModal" class="modal">
        <div class="modal-content">
            <h3 style="margin-bottom: 15px; color: #e94560;">🚙 Seleccionar Vehículo</h3>
            <div class="search-box">
                <input type="text" id="brandSearch" placeholder="🔍 Buscar marca o modelo..." onkeyup="filterBrandsAndModels()">
            </div>
            <div id="brandsContainer" style="max-height: 500px; overflow-y: auto;"></div>
            <button class="btn btn-secondary" onclick="closeModal()" style="margin-top: 15px; width: 100%;">Cerrar</button>
        </div>
    </div>

    <script>
        // Base de datos de vehículos (simplificada para el ejemplo)
        const VEHICLE_DATABASE = {
            "TOYOTA": { "models": ["YARIS", "COROLLA", "HILUX", "RAV4"] },
            "HONDA": { "models": ["CIVIC", "ACCORD", "CR-V"] },
            "NISSAN": { "models": ["VERSA", "SENTRA", "X-TRAIL"] },
            "CHEVROLET": { "models": ["ONIX", "CRUZE", "SPARK"] },
            "FORD": { "models": ["FIESTA", "FOCUS", "RANGER"] },
            "HYUNDAI": { "models": ["ACCENT", "ELANTRA", "TUCSON"] },
            "KIA": { "models": ["RIO", "SPORTAGE", "SORENTO"] },
            "VOLKSWAGEN": { "models": ["GOL", "POLO", "T-CROSS"] }
        };

        // Comandos OBD-II
        const OBD_COMMANDS_BY_TYPE = {
            "🔧 AT (Configuración)": [
                { cmd: "ATZ", desc: "Resetear ELM327" }, { cmd: "ATE0", desc: "Desactivar echo" },
                { cmd: "ATL0", desc: "Desactivar linefeeds" }, { cmd: "ATH0", desc: "Desactivar headers" },
                { cmd: "ATSP0", desc: "Protocolo auto" }, { cmd: "ATRV", desc: "Voltaje vehículo" },
                { cmd: "ATI", desc: "Versión ELM327" }, { cmd: "ATDP", desc: "Protocolo OBD" }
            ],
            "📊 Mode 01 - Datos en vivo": [
                { cmd: "010C", desc: "RPM motor" }, { cmd: "010D", desc: "Velocidad" },
                { cmd: "0105", desc: "Temp refrigerante" }, { cmd: "0104", desc: "Carga motor" },
                { cmd: "0111", desc: "Posición acelerador" }, { cmd: "012F", desc: "Nivel combustible" }
            ],
            "⚠️ Mode 03 - DTC (Fallas)": [
                { cmd: "03", desc: "Leer códigos DTC" }, { cmd: "04", desc: "Borrar códigos DTC" }
            ]
        };

        // Variables globales
        let bluetoothDevice = null;
        let characteristic = null;
        let isConnected = false;
        let isDemoMode = false;
        let currentMarca = "TOYOTA";
        let currentModelo = "YARIS";
        let currentDTCs = [];
        let isLogging = false;
        let dataInterval = null;
        let currentValues = { SPEED: 0, RPM: 0, COOLANT_TEMP: 85, THROTTLE_POS: 0, FUEL_LEVEL: 75, BATTERY_VOLTAGE: 12.5 };
        let activeAlerts = {};
        let logData = [];
        let commandHistory = [];

        let alertThresholds = {
            SPEED: { warning: 120, critical: 160, unit: "km/h" },
            RPM: { warning: 5000, critical: 6500, unit: "rpm" },
            COOLANT_TEMP: { min: 70, max: 105, critical_max: 120, unit: "°C" },
            BATTERY_VOLTAGE: { min: 11.5, max: 14.5, critical_min: 10.5, unit: "V" },
            FUEL_LEVEL: { min: 15, critical_min: 5, unit: "%" }
        };

        // ============================================
        // FUNCIÓN DE DIAGNÓSTICO MEJORADA
        // ============================================
        async function runDiagnostic() {
            const resultsDiv = document.getElementById('diagnosticResults');
            resultsDiv.innerHTML = '<div class="diagnostic-step">🔍 Iniciando diagnóstico del sistema...</div>';
            
            const steps = [];
            
            // Paso 1: Verificar Web Bluetooth
            steps.push({ name: "Web Bluetooth API", test: () => !!navigator.bluetooth, pass: "✅ Compatible", fail: "❌ No compatible - Use Chrome/Edge/Opera" });
            
            // Paso 2: Verificar HTTPS/localhost
            steps.push({ name: "Conexión Segura", test: () => location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1', pass: "✅ Conexión segura", fail: "⚠️ Se requiere HTTPS o localhost" });
            
            // Paso 3: Verificar Bluetooth del sistema
            if (navigator.bluetooth) {
                try {
                    const available = await navigator.bluetooth.getAvailability();
                    steps.push({ name: "Bluetooth Hardware", test: () => available, pass: "✅ Bluetooth disponible", fail: "❌ Bluetooth no disponible - Active Bluetooth" });
                } catch(e) {
                    steps.push({ name: "Bluetooth Hardware", test: () => false, pass: "", fail: "❌ No se pudo verificar Bluetooth" });
                }
            } else {
                steps.push({ name: "Bluetooth Hardware", test: () => false, pass: "", fail: "❌ Web Bluetooth no soportado" });
            }
            
            // Paso 4: Verificar permisos
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const result = await navigator.permissions.query({ name: 'bluetooth' });
                    steps.push({ name: "Permisos Bluetooth", test: () => result.state === 'granted' || result.state === 'prompt', pass: "✅ Permisos disponibles", fail: "⚠️ Permisos restringidos" });
                } catch(e) {
                    steps.push({ name: "Permisos Bluetooth", test: () => true, pass: "⚠️ No se pueden verificar permisos", fail: "" });
                }
            }
            
            // Mostrar resultados
            resultsDiv.innerHTML = '<h4>📋 Resultados del Diagnóstico:</h4>';
            let allPass = true;
            
            for (const step of steps) {
                const result = step.test();
                const statusClass = result ? 'pass' : 'fail';
                const statusText = result ? (step.pass || '✅ OK') : (step.fail || '❌ Error');
                if (!result) allPass = false;
                resultsDiv.innerHTML += `<div class="diagnostic-step ${statusClass}"><strong>${step.name}:</strong> ${statusText}</div>`;
            }
            
            // Recomendaciones
            resultsDiv.innerHTML += '<h4>💡 Recomendaciones:</h4>';
            if (!navigator.bluetooth) {
                resultsDiv.innerHTML += '<div class="diagnostic-step warning">➡️ Use Google Chrome, Microsoft Edge u Opera en su computadora o Android</div>';
            }
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                resultsDiv.innerHTML += '<div class="diagnostic-step warning">➡️ La aplicación debe ejecutarse en HTTPS o localhost</div>';
            }
            resultsDiv.innerHTML += '<div class="diagnostic-step">➡️ Asegúrese de que el adaptador ELM327 esté conectado al vehículo</div>';
            resultsDiv.innerHTML += '<div class="diagnostic-step">➡️ El vehículo debe estar encendido (posición contacto)</div>';
            resultsDiv.innerHTML += '<div class="diagnostic-step">➡️ Verifique que el adaptador esté emparejado en Configuración Bluetooth</div>';
            resultsDiv.innerHTML += '<div class="diagnostic-step">➡️ Algunos adaptadores requieren que el LED azul parpadee constantemente</div>';
            resultsDiv.innerHTML += '<div class="diagnostic-step">➡️ Si todo falla, use el MODO DEMO para probar la aplicación</div>';
            
            if (allPass) {
                resultsDiv.innerHTML += '<div class="diagnostic-step pass">✅ Su sistema está listo para conectar un dispositivo OBD-II</div>';
            }
            
            addConsoleLog("🔧 Diagnóstico completado", "info");
        }
        
        function clearDiagnostic() {
            document.getElementById('diagnosticResults').innerHTML = '<p>Diagnóstico limpiado. Presione "Iniciar Diagnóstico" para verificar su sistema.</p>';
        }

        // ============================================
        // FUNCIONES DE VEHÍCULO
        // ============================================
        function showVehicleModal() {
            document.getElementById('vehicleModal').style.display = 'flex';
            loadBrandsList();
        }

        function closeModal() {
            document.getElementById('vehicleModal').style.display = 'none';
        }

        function loadBrandsList() {
            const container = document.getElementById('brandsContainer');
            container.innerHTML = '';
            
            const sortedBrands = Object.keys(VEHICLE_DATABASE).sort();
            
            for (const brand of sortedBrands) {
                const models = VEHICLE_DATABASE[brand].models;
                
                const group = document.createElement('div');
                group.className = 'brand-group';
                group.setAttribute('data-brand', brand);
                
                const header = document.createElement('div');
                header.className = 'brand-header';
                header.innerHTML = `🚗 ${brand} <span style="font-size: 0.8rem;">▼</span>`;
                header.onclick = (function(b) { return function() { toggleBrand(b); }; })(brand);
                
                const modelsContainer = document.createElement('div');
                modelsContainer.className = 'models-list';
                modelsContainer.id = `brand-models-${brand.replace(/\s/g, '-')}`;
                
                models.forEach(model => {
                    const chip = document.createElement('span');
                    chip.className = 'model-chip';
                    chip.textContent = model;
                    chip.onclick = (function(marca, modelo) { return function() { selectVehicleModel(marca, modelo); }; })(brand, model);
                    modelsContainer.appendChild(chip);
                });
                
                group.appendChild(header);
                group.appendChild(modelsContainer);
                container.appendChild(group);
            }
        }

        function toggleBrand(brand) {
            const modelsContainer = document.getElementById(`brand-models-${brand.replace(/\s/g, '-')}`);
            if (modelsContainer) modelsContainer.classList.toggle('show');
        }

        function filterBrandsAndModels() {
            const searchTerm = document.getElementById('brandSearch').value.toLowerCase();
            const groups = document.querySelectorAll('.brand-group');
            
            groups.forEach(group => {
                const brandName = group.getAttribute('data-brand').toLowerCase();
                const models = group.querySelectorAll('.model-chip');
                let hasMatch = false;
                
                if (brandName.includes(searchTerm)) {
                    group.style.display = 'block';
                    const modelsContainer = group.querySelector('.models-list');
                    if (modelsContainer) modelsContainer.classList.add('show');
                    hasMatch = true;
                } else {
                    models.forEach(model => {
                        const modelName = model.textContent.toLowerCase();
                        if (modelName.includes(searchTerm)) hasMatch = true;
                    });
                    group.style.display = hasMatch ? 'block' : 'none';
                    if (hasMatch) {
                        const modelsContainer = group.querySelector('.models-list');
                        if (modelsContainer) modelsContainer.classList.add('show');
                    }
                }
            });
        }

        function selectVehicleModel(marca, modelo) {
            currentMarca = marca;
            currentModelo = modelo;
            document.getElementById('vehicleInfo').innerHTML = `🚙 ${marca} ${modelo}`;
            closeModal();
            addConsoleLog(`✅ Vehículo seleccionado: ${marca} ${modelo}`, "success");
        }

        // ============================================
        // CARGAR TABS Y COMANDOS
        // ============================================
        function loadCommandTabs() {
            const tabsContainer = document.getElementById('cmdTabs');
            const panelsContainer = document.getElementById('cmdPanels');
            
            tabsContainer.innerHTML = '';
            panelsContainer.innerHTML = '';
            
            let firstTab = true;
            for (const [category, commands] of Object.entries(OBD_COMMANDS_BY_TYPE)) {
                const tab = document.createElement('button');
                tab.className = 'cmd-tab' + (firstTab ? ' active' : '');
                tab.textContent = category;
                tab.onclick = () => {
                    document.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.cmd-panel').forEach(p => p.classList.remove('active'));
                    tab.classList.add('active');
                    document.getElementById(`panel-${category.replace(/[^a-zA-Z0-9]/g, '-')}`).classList.add('active');
                };
                tabsContainer.appendChild(tab);
                
                const panel = document.createElement('div');
                panel.className = 'cmd-panel' + (firstTab ? ' active' : '');
                panel.id = `panel-${category.replace(/[^a-zA-Z0-9]/g, '-')}`;
                
                const cmdList = document.createElement('div');
                cmdList.className = 'cmd-horizontal-list';
                
                commands.forEach(cmdInfo => {
                    const cmdCard = document.createElement('div');
                    cmdCard.className = 'cmd-card-h';
                    cmdCard.onclick = () => {
                        document.getElementById('commandInput').value = cmdInfo.cmd;
                        sendRawCommand();
                    };
                    cmdCard.innerHTML = `<div class="cmd-code-h">${cmdInfo.cmd}</div><div class="cmd-desc-h">${cmdInfo.desc}</div>`;
                    cmdList.appendChild(cmdCard);
                });
                
                panel.appendChild(cmdList);
                panelsContainer.appendChild(panel);
                firstTab = false;
            }
        }

        // ============================================
        // MODO DEMOSTRACIÓN
        // ============================================
        function enableDemoMode() {
            if (isConnected && !isDemoMode) disconnectBluetooth();
            isDemoMode = true;
            isConnected = true;
            
            document.getElementById('obdLed').className = 'led demo';
            document.getElementById('obdStatus').textContent = 'Modo Demo';
            document.getElementById('btLed').className = 'led demo';
            document.getElementById('btStatus').textContent = 'Modo Demo';
            document.getElementById('deviceLed').className = 'led demo';
            document.getElementById('deviceName').textContent = 'Simulador OBD-II';
            document.getElementById('connectBtn').style.display = 'none';
            document.getElementById('disconnectBtn').style.display = 'inline-block';
            
            addConsoleLog("🎮 Modo demostración activado - Datos simulados", "info");
            startDemoPolling();
        }

        function startDemoPolling() {
            if (dataInterval) clearInterval(dataInterval);
            dataInterval = setInterval(() => {
                if (isDemoMode) {
                    currentValues.SPEED = Math.floor(Math.random() * 120);
                    currentValues.RPM = 700 + Math.floor(Math.random() * 5000);
                    currentValues.COOLANT_TEMP = 80 + Math.floor(Math.random() * 20);
                    currentValues.THROTTLE_POS = Math.floor(Math.random() * 100);
                    currentValues.FUEL_LEVEL = Math.max(0, currentValues.FUEL_LEVEL - (Math.random() * 0.5));
                    if (currentValues.FUEL_LEVEL < 0) currentValues.FUEL_LEVEL = 100;
                    currentValues.BATTERY_VOLTAGE = 12 + (Math.random() * 2);
                    
                    checkAlerts();
                    updateDashboard();
                    
                    if (isLogging) {
                        logData.push({ timestamp: new Date().toISOString(), ...currentValues });
                        document.getElementById('loggingStatus').innerHTML = `<p>📝 Registrando... ${logData.length} muestras</p>`;
                    }
                }
            }, 2000);
        }

        // ============================================
        // WEB BLUETOOTH API MEJORADA
        // ============================================
        async function connectBluetooth() {
            try {
                if (!navigator.bluetooth) {
                    addConsoleLog("❌ Web Bluetooth no es compatible. Use Chrome/Edge/Opera.", "error");
                    addConsoleLog("💡 Use el MODO DEMO para probar la aplicación", "info");
                    alert("Web Bluetooth no es compatible.\n\n✅ Use Google Chrome, Microsoft Edge u Opera\n✅ Active el Modo Demo para probar");
                    return;
                }
                
                addConsoleLog("🔍 Buscando dispositivos ELM327...", "info");
                addConsoleLog("💡 Asegúrese de que:", "info");
                addConsoleLog("   1️⃣ Adaptador OBD-II conectado al vehículo", "info");
                addConsoleLog("   2️⃣ Vehículo encendido (posición contacto)", "info");
                addConsoleLog("   3️⃣ Adaptador emparejado en Bluetooth del sistema", "info");
                
                document.getElementById('btLed').className = 'led searching';
                document.getElementById('btStatus').textContent = 'Bluetooth: Buscando...';

                // Intento con filtros más amplios
				bluetoothDevice = await navigator.bluetooth.requestDevice({
					filters: [
						{ namePrefix: 'OBD' },
						{ namePrefix: 'ELM' },
						{ namePrefix: 'V-LINK' },
						{ services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] } // El servicio serial más común en BLE
					],
					optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
				});

                if (!bluetoothDevice) throw new Error("No se seleccionó ningún dispositivo");

                addConsoleLog(`✅ Dispositivo encontrado: ${bluetoothDevice.name || 'ELM327'}`, "success");
                document.getElementById('deviceName').textContent = bluetoothDevice.name || 'ELM327';
                document.getElementById('deviceLed').className = 'led connected';

                bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
                
                addConsoleLog("🔗 Conectando al servidor GATT...", "info");
                const server = await bluetoothDevice.gatt.connect();
                addConsoleLog("✅ Conectado al servidor GATT", "success");
                
                // Buscar servicio OBD-II
                let service;
                try {
                    service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
                } catch (e) {
                    addConsoleLog("⚠️ Buscando servicios disponibles...", "info");
                    const services = await server.getPrimaryServices();
                    for (let s of services) {
                        addConsoleLog(`📋 Servicio: ${s.uuid}`, "info");
                        if (s.uuid.includes('ffe0') || s.uuid.includes('ff10')) {
                            service = s;
                            break;
                        }
                    }
                    if (!service) throw new Error("No se encontró servicio OBD-II");
                }
                
                // Buscar característica
                const characteristics = await service.getCharacteristics();
                for (let c of characteristics) {
                    addConsoleLog(`📋 Característica: ${c.uuid}`, "info");
                    if (c.uuid.includes('ffe1') || c.uuid.includes('ff11')) {
                        characteristic = c;
                        break;
                    }
                }
                
                if (!characteristic) {
                    // Intentar con la primera característica que tenga escritura
                    for (let c of characteristics) {
                        const props = c.properties;
                        if (props.write || props.writeWithoutResponse) {
                            characteristic = c;
                            addConsoleLog(`✅ Usando característica alternativa: ${c.uuid}`, "success");
                            break;
                        }
                    }
                }
                
                if (!characteristic) throw new Error("No se encontró característica para comunicación");
                
                if (characteristic.properties.notify || characteristic.properties.indicate) {
                    await characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', handleDataReceived);
                }
                
                isConnected = true;
                isDemoMode = false;
                document.getElementById('obdLed').className = 'led connected';
                document.getElementById('obdStatus').textContent = 'Conectado';
                document.getElementById('btLed').className = 'led bluetooth';
                document.getElementById('btStatus').textContent = 'Bluetooth: Conectado';
                document.getElementById('connectBtn').style.display = 'none';
                document.getElementById('disconnectBtn').style.display = 'inline-block';
                
                addConsoleLog("🎉 Conexión exitosa! Inicializando ELM327...", "success");
                await initializeELM327();
                startDataPolling();
            } catch (error) {
                addConsoleLog(`❌ Error: ${error.message}`, "error");
                if (error.message.includes('choosing a device')) {
                    addConsoleLog("💡 No seleccionó ningún dispositivo", "info");
                } else if (error.message.includes('User cancelled')) {
                    addConsoleLog("💡 Búsqueda cancelada por el usuario", "info");
                } else {
                    addConsoleLog("💡 Verifique:", "info");
                    addConsoleLog("   • El adaptador esté encendido (LED encendido)", "info");
                    addConsoleLog("   • El vehículo esté encendido", "info");
                    addConsoleLog("   • El adaptador esté emparejado en Windows/Android", "info");
                }
                document.getElementById('btLed').className = 'led';
                document.getElementById('btStatus').textContent = 'Bluetooth: Error';
                document.getElementById('connectBtn').style.display = 'inline-block';
                document.getElementById('disconnectBtn').style.display = 'none';
            }
        }

        async function initializeELM327() {
            addConsoleLog("⚙️ Configurando ELM327...", "info");
            await sendCommand("ATZ");
            await sleep(1000);
            await sendCommand("ATE0");
            await sleep(200);
            await sendCommand("ATL0");
            await sleep(200);
            await sendCommand("ATH0");
            await sleep(200);
            await sendCommand("ATSP0");
            await sleep(500);
            addConsoleLog("✅ ELM327 inicializado correctamente", "success");
        }

        async function sendCommand(cmd) {
            if (!characteristic && !isDemoMode) {
                addConsoleLog("❌ No hay conexión activa", "error");
                return false;
            }
            
            if (isDemoMode) {
                addConsoleLog(`📤 [DEMO] Enviado: ${cmd}`, "info");
                await sleep(100);
                return true;
            }
            
            try {
                const encoder = new TextEncoder();
                await characteristic.writeValue(encoder.encode(cmd + "\r"));
                addConsoleLog(`📤 Enviado: ${cmd}`, "info");
                return true;
            } catch (error) {
                addConsoleLog(`❌ Error al enviar comando: ${error.message}`, "error");
                return false;
            }
        }

        async function sendRawCommand() {
            const cmd = document.getElementById('commandInput').value.trim();
            if (!cmd) return;
            
            if (!commandHistory.includes(cmd)) {
                commandHistory.unshift(cmd);
                if (commandHistory.length > 20) commandHistory.pop();
                const datalist = document.getElementById('commandHistory');
                datalist.innerHTML = commandHistory.map(c => `<option value="${c}">`).join('');
            }
            
            await sendCommand(cmd);
            document.getElementById('commandInput').value = '';
        }

        function handleDataReceived(event) {
            const value = event.target.value;
            const decoder = new TextDecoder();
            const response = decoder.decode(value);
            addConsoleLog(`📥 Recibido: ${response.trim()}`, "success");
        }

        function startDataPolling() {
            if (dataInterval) clearInterval(dataInterval);
            dataInterval = setInterval(async () => {
                if (isConnected && characteristic && !isDemoMode) {
                    await sendCommand("010D");
                    await sleep(100);
                    await sendCommand("010C");
                    await sleep(100);
                    await sendCommand("0105");
                    checkAlerts();
                    updateDashboard();
                    
                    if (isLogging) {
                        logData.push({ timestamp: new Date().toISOString(), ...currentValues });
                        document.getElementById('loggingStatus').innerHTML = `<p>📝 Registrando... ${logData.length} muestras</p>`;
                    }
                }
            }, 2000);
        }

        function onDisconnected() {
            addConsoleLog("⚠️ Dispositivo desconectado", "error");
            if (!isDemoMode) {
                isConnected = false;
                document.getElementById('obdLed').className = 'led';
                document.getElementById('obdStatus').textContent = 'Desconectado';
                document.getElementById('btLed').className = 'led';
                document.getElementById('btStatus').textContent = 'Bluetooth: Desconectado';
                document.getElementById('connectBtn').style.display = 'inline-block';
                document.getElementById('disconnectBtn').style.display = 'none';
                document.getElementById('deviceLed').className = 'led';
                document.getElementById('deviceName').textContent = 'Sin dispositivo';
                if (dataInterval) clearInterval(dataInterval);
            }
        }

        function disconnectBluetooth() {
            if (isDemoMode) {
                isDemoMode = false;
                isConnected = false;
                if (dataInterval) clearInterval(dataInterval);
                document.getElementById('obdLed').className = 'led';
                document.getElementById('obdStatus').textContent = 'Desconectado';
                document.getElementById('btLed').className = 'led';
                document.getElementById('btStatus').textContent = 'Bluetooth: Desconectado';
                document.getElementById('deviceLed').className = 'led';
                document.getElementById('deviceName').textContent = 'Sin dispositivo';
                document.getElementById('connectBtn').style.display = 'inline-block';
                document.getElementById('disconnectBtn').style.display = 'none';
                addConsoleLog("🎮 Modo Demo desactivado", "info");
            } else if (bluetoothDevice && bluetoothDevice.gatt.connected) {
                bluetoothDevice.gatt.disconnect();
            }
            onDisconnected();
        }

        function addConsoleLog(message, type = "info") {
            const consoleDiv = document.getElementById('consoleLog');
            const entry = document.createElement('div');
            entry.className = `log-entry log-${type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            consoleDiv.appendChild(entry);
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        }

        function clearConsole() { 
            document.getElementById('consoleLog').innerHTML = '<div class="log-entry">📟 Consola limpiada</div>';
        }
        
        function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

        // ============================================
        // FUNCIONES DE LA APLICACIÓN
        // ============================================
        function checkAlerts() {
            for (let [pid, value] of Object.entries(currentValues)) {
                if (alertThresholds[pid]) {
                    let t = alertThresholds[pid];
                    let alertMsg = null;
                    if (t.critical_min && value < t.critical_min) alertMsg = `🔴 CRÍTICO! ${pid}: ${value.toFixed(1)} ${t.unit}`;
                    else if (t.min && value < t.min) alertMsg = `⚠️ ADVERTENCIA: ${pid} bajo: ${value.toFixed(1)} ${t.unit}`;
                    else if (t.critical_max && value > t.critical_max) alertMsg = `🔴 CRÍTICO! ${pid} alto: ${value.toFixed(1)} ${t.unit}`;
                    else if (t.max && value > t.max) alertMsg = `⚠️ ADVERTENCIA: ${pid} alto: ${value.toFixed(1)} ${t.unit}`;
                    else if (t.warning && value > t.warning) alertMsg = `⚠️ EXCESO VELOCIDAD: ${value.toFixed(0)} ${t.unit}`;
                    
                    if (alertMsg && (!activeAlerts[pid] || (Date.now() - activeAlerts[pid].timestamp) > 10000)) {
                        activeAlerts[pid] = { message: alertMsg, timestamp: Date.now() };
                        updateAlertsPanel();
                        addConsoleLog(alertMsg, "error");
                    } else if (!alertMsg && activeAlerts[pid]) delete activeAlerts[pid];
                }
            }
        }

        function updateAlertsPanel() {
            const container = document.getElementById('activeAlerts');
            container.innerHTML = Object.keys(activeAlerts).length === 0 ? '<p>✅ No hay alertas activas</p>' :
                Object.values(activeAlerts).map(a => `<div class="alert-item">${a.message}</div>`).join('');
        }

        function updateDashboard() {
            const gauges = [
                { pid: 'SPEED', name: 'Velocidad', unit: 'km/h', min: 0, max: 200, icon: '🏎️' },
                { pid: 'RPM', name: 'RPM', unit: 'rpm', min: 0, max: 8000, icon: '⚡' },
                { pid: 'COOLANT_TEMP', name: 'Temp Motor', unit: '°C', min: 0, max: 130, icon: '🌡️' },
                { pid: 'THROTTLE_POS', name: 'Acelerador', unit: '%', min: 0, max: 100, icon: '🎛️' },
                { pid: 'FUEL_LEVEL', name: 'Combustible', unit: '%', min: 0, max: 100, icon: '⛽' },
                { pid: 'BATTERY_VOLTAGE', name: 'Batería', unit: 'V', min: 10, max: 15, icon: '🔋' }
            ];
            document.getElementById('dashboardGrid').innerHTML = gauges.map(g => {
                let value = currentValues[g.pid] || 0;
                let percent = Math.min(100, Math.max(0, ((value - g.min) / (g.max - g.min)) * 100));
                let color = percent > 80 ? '#e94560' : (percent > 60 ? '#ffaa00' : '#00ff88');
                let displayValue = g.pid === 'RPM' ? Math.round(value) : value.toFixed(1);
                return `<div class="gauge-card"><div>${g.icon} ${g.name}</div><div class="gauge-value" style="color:${color}">${displayValue}</div><div class="gauge-unit">${g.unit}</div><div class="gauge-bar"><div class="gauge-fill" style="width:${percent}%"></div></div></div>`;
            }).join('');
        }

        async function readDTC() { 
            if (!isConnected) { alert('⚠️ Conecte un dispositivo OBD-II o active el Modo Demo'); return; } 
            await sendCommand("03"); 
            addConsoleLog("📋 Lectura de códigos DTC solicitada", "info");
        }
        
        async function clearDTC() { 
            if (!isConnected) { alert('⚠️ Conecte un dispositivo OBD-II'); return; }
            if (confirm('⚠️ ¿Borrar códigos de falla?')) { 
                await sendCommand("04"); 
                currentDTCs = []; 
                addConsoleLog("✅ Códigos DTC borrados", "success"); 
            } 
        }
        
        function startPerformanceTest(type) { 
            addConsoleLog(`🏁 Iniciando prueba: ${type === '0-100' ? '0-100 km/h' : '1/4 milla'}`, "info");
            alert(`Prueba ${type === '0-100' ? '0-100 km/h' : '1/4 milla'} - Acelere a fondo`);
        }
        
        function startDataLogging() { 
            if (isLogging) return; 
            isLogging = true; 
            logData = []; 
            document.getElementById('loggingStatus').innerHTML = '<p>📝 Registrando datos...</p>'; 
            addConsoleLog("📝 Inicio de registro", "success"); 
        }
        
        function stopDataLogging() { 
            if (isLogging && logData.length) { 
                const csv = convertToCSV(logData); 
                downloadCSV(csv, `obd_log_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`); 
                document.getElementById('loggingStatus').innerHTML = `<p>✅ Guardado: ${logData.length} muestras</p>`; 
                addConsoleLog(`✅ Guardado: ${logData.length} muestras`, "success"); 
                isLogging = false; 
            } else if (isLogging) { 
                isLogging = false; 
                document.getElementById('loggingStatus').innerHTML = '<p>⏹️ Detenido</p>'; 
            }
        }
        
        function convertToCSV(data) { 
            if (!data.length) return "";
            const headers = Object.keys(data[0]); 
            return [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))].join('\n'); 
        }
        
        function downloadCSV(csv, filename) { 
            const blob = new Blob([csv], { type: 'text/csv' }); 
            const link = document.createElement('a'); 
            link.href = URL.createObjectURL(blob); 
            link.download = filename; 
            link.click(); 
        }
        
        function showMaintenanceStatus() { 
            const km = parseInt(document.getElementById('currentKm').value); 
            if (!km) { alert('Ingrese kilometraje'); return; } 
            const intervals = [
                { name: 'Cambio de aceite', interval: 10000, icon: '🛢️' },
                { name: 'Filtro de aire', interval: 20000, icon: '🌬️' },
                { name: 'Bujías', interval: 60000, icon: '⚡' }
            ];
            document.getElementById('maintenanceStatus').innerHTML = intervals.map(s => { 
                let nextKm = Math.ceil(km / s.interval) * s.interval; 
                let remaining = nextKm - km; 
                let percent = ((km % s.interval) / s.interval) * 100; 
                return `<div class="maintenance-item"><div>${s.icon} ${s.name}</div><div class="progress-container"><div class="progress-label"><span>Próximo</span><span>${remaining} km</span></div><div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div></div></div>`; 
            }).join(''); 
        }
        
        function startDrivingAnalysis() { 
            addConsoleLog("🎯 Análisis de conducción iniciado", "info");
            alert("Análisis de conducción por 60 segundos.");
        }
        
        async function readECUInfo() { 
            if (!isConnected) { alert('Conecte OBD-II'); return; }
            await sendCommand("ATI"); 
            document.getElementById('ecuInfo').innerHTML = `<table class="data-table"><tr><th>Parámetro</th><th>Valor</th></tr><tr><td>Vehículo</td><td>${currentMarca} ${currentModelo}</td></tr><tr><td>ELM327</td><td>v1.5</td></tr></table>`; 
        }
        
        function loadAlertConfig() { 
            document.getElementById('alertConfig').innerHTML = Object.entries(alertThresholds).map(([pid, t]) => `<div class="maintenance-item"><strong>${pid}</strong><input type="number" id="alert_${pid}_warning" placeholder="Advertencia" value="${t.warning || ''}"><input type="number" id="alert_${pid}_critical" placeholder="Crítico" value="${t.critical || t.critical_max || ''}"></div>`).join(''); 
        }
        
        function saveAlertConfig() { 
            for (let pid of Object.keys(alertThresholds)) { 
                let warning = document.getElementById(`alert_${pid}_warning`)?.value; 
                let critical = document.getElementById(`alert_${pid}_critical`)?.value; 
                if (warning) alertThresholds[pid].warning = parseFloat(warning); 
                if (critical) { 
                    if (alertThresholds[pid].critical) alertThresholds[pid].critical = parseFloat(critical); 
                    if (alertThresholds[pid].critical_max) alertThresholds[pid].critical_max = parseFloat(critical); 
                } 
            } 
            alert('✅ Configuración guardada'); 
        }

        // ============================================
        // INICIALIZACIÓN
        // ============================================
        function init() {
            document.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', function() {
                    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
                    this.classList.add('active');
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    document.getElementById(this.dataset.page).classList.add('active');
                });
            });
            loadCommandTabs();
            loadAlertConfig();
            addConsoleLog("🚀 Aplicación inicializada", "success");
            addConsoleLog("💡 Use 'Diagnóstico' para verificar compatibilidad", "info");
        }
        init();
    </script>
</body>
</html>
