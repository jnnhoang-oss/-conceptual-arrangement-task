<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conceptual Arrangement Task</title>
    <link rel="stylesheet" href="styles.css" />
</head>
<body>
    <!-- Full Screen Modal -->
    <div id="fullScreenModal" class="modal">
        <div class="modal-content">
            <h2>Full Screen Required</h2>
            <p>Please press F11 or use your browser's full-screen mode before starting the experiment.</p>
            <button id="fullScreenBtn">I'm in Full Screen</button>
        </div>
    </div>

    <!-- 🟢 Instruction Screen -->
    <div id="instructions" class="screen visible">
        <div class="content">
            <h1>Conceptual Arrangement Task</h1>
            <div class="instruction-details">
                <p>
                    In this experiment, you will use the mouse to click and drag images around the screen.
                    Drag them from the left panel into the circular arena on the right, and arrange them so conceptually similar items are closer together.
                </p>
                <ul class="task-guidelines">
                    <li>🖱️ Click and drag images</li>
                    <li>🎯 Place similar images closer together</li>
                    <li>⏱️ Time will be tracked</li>
                </ul>
                <div class="attention-warning">
                    <p>⚠️ Ensure you are in a quiet, distraction-free environment</p>
                </div>
            </div>
            <div class="start-section">
                <p>Press the <b>SPACEBAR</b> or click below to begin.</p>
                <button id="beginBtn" class="start-btn">Begin Practice Round</button>
            </div>
        </div>
    </div>

    <!-- 🟣 Main Arena Container -->
    <div id="arenaContainer" class="screen">
        <div id="arena" class="arena-circle">
            <div id="arenaText" class="arena-instructions">
                <p>Click and drag images into the circular arena</p>
                <p class="small-text">(Double-click for smoother interaction on MacBook/desktop)</p>
            </div>
        </div>
        <div id="warningMessage" class="warning-message">
            ⚠ Please move all images inside the arena before continuing
        </div>
        <div id="timerDisplay" class="timer">
            Total Time: <span id="totalTime">0</span>s
        </div>
    </div>

    <!-- 🟡 Attention and Device Questions -->
    <div id="questions" class="screen">
        <div class="question-container">
            <div id="q1" class="question">
                <h2>Attention Check</h2>
                <p>Did you pay full attention during the task? (Be honest)</p>
                <div class="button-group">
                    <button onclick="recordAnswer('attention','Yes')">Yes</button>
                    <button onclick="recordAnswer('attention','No')">No</button>
                </div>
            </div>
            <div id="q2" class="question" style="display:none;">
                <h2>Device Consistency</h2>
                <p>Are you using the same device as the first time?</p>
                <div class="button-group">
                    <button onclick="recordAnswer('device','Yes')">Yes</button>
                    <button onclick="recordAnswer('device','No')">No</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 💤 Groningen Sleep Quality Scale (GSQS) -->
    <div id="gsqsScreen" class="screen">
        <div class="content">
            <h2>Groningen Sleep Quality Scale (GSQS)</h2>
            <p class="subtext">Please answer each statement below with Yes or No</p>

            <form id="gsqsForm">
                <!-- Your existing GSQS questions remain the same -->
                <button type="button" class="submit-btn" onclick="submitGSQS()">Submit Responses</button>
            </form>
        </div>
    </div>

    <!-- 🔵 End Screen -->
    <div id="endScreen" class="screen">
        <div class="content">
            <h2>Thank You!</h2>
            <p>Your responses have been recorded and downloaded.</p>
            <p class="thank-you-note">
                We sincerely appreciate your participation. Your contribution helps advance our research 
                on conceptual arrangement and cognitive processing.
            </p>
            <div class="completion-details">
                <p>Total Task Time: <span id="finalTime"></span></p>
                <p>Data Exported: CSV File</p>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
