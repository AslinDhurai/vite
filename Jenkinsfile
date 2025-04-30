pipeline {
    agent none
    parameters {
        choice(name: 'TARGET_AGENT', choices: ['All Agents', 'Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5'], description: 'Select which agent(s) to deploy to')
    }
    environment {
        REPO_URL = 'https://github.com/AslinDhurai/vite.git'
        BRANCH = 'main'
        IIS_SITE_PATH = 'C:\\inetpub\\wwwroot\\my-app'
        NODE_OPTIONS = "--openssl-legacy-provider"
        AGENT1_API_URL = 'http://192.168.52.33:8084'
        WORKSPACE_PATH = 'C:\\Jenkins\\workspace\\My-Vite' // Add your actual workspace path
    }
    
    stages {
        stage('Deploy to Agent 1') {
            when {
                expression { params.TARGET_AGENT == 'Agent 1' || params.TARGET_AGENT == 'All Agents' }
            }
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                        if (!isAgentOnline('Aslin-agent')) {
                            emailext to: 'demojenkinscicd@gmail.com',
                                     subject: "Vite Deployment failed: Agent 1 offline",
                                     body: "Agent 1 (Aslin-agent) is offline, deployment could not proceed."
                            error "Agent 1 is offline."
                        } else {
                            node('Aslin-agent') {
                                withEnv(["PATH+NODE=${tool 'NodeJS'}\\bin"]) {
                                    timeout(time: 15, unit: 'MINUTES') {
                                        bat """
                                            @echo on
                                            echo Starting deployment process...
                                            
                                            echo [1/6] Cleaning existing repo...
                                            if exist "${WORKSPACE_PATH}\\vite" rd /s /q "${WORKSPACE_PATH}\\vite"
                                            
                                            echo [2/6] Cloning repository...
                                            git clone --branch ${BRANCH} ${REPO_URL} "${WORKSPACE_PATH}\\vite"
                                            
                                            echo [3/6] Setting up environment...
                                            cd "${WORKSPACE_PATH}\\vite"
                                            echo VITE_API_URL=${AGENT1_API_URL} > .env
                                            
                                            echo [4/6] Installing dependencies...
                                            npm install
                                            
                                            echo [5/6] Building application...
                                            npm run build
                                            
                                            echo [6/6] Deploying to IIS...
                                            if exist "${IIS_SITE_PATH}" (
                                                echo Removing existing IIS content...
                                                rd /s /q "${IIS_SITE_PATH}"
                                            )
                                            mkdir "${IIS_SITE_PATH}"
                                            xcopy "${WORKSPACE_PATH}\\vite\\dist\\*" "${IIS_SITE_PATH}\\" /E /I /Y /C
                                            
                                            echo Verifying deployment...
                                            dir "${IIS_SITE_PATH}"
                                            echo Deployment completed successfully!
                                        """
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Deployment process completed. Check logs for details.'
        }
        success {
            emailext to: 'demojenkinscicd@gmail.com',
                     subject: "Successful Vite Deployment to ${params.TARGET_AGENT}",
                     body: "Vite application was successfully deployed to selected agents."
        }
        failure {
            emailext to: 'demojenkinscicd@gmail.com',
                     subject: "Partial/Failed Vite Deployment to ${params.TARGET_AGENT}",
                     body: "There were issues deploying the Vite application. Check Jenkins build logs for details."
        }
    }
}

@NonCPS
def isAgentOnline(String name) {
    def agent = Jenkins.instance.getNode(name)
    if (agent == null) {
        echo "Agent ${name} does not exist."
        return false
    }
    def computer = agent.toComputer()
    return (computer != null && computer.isOnline())
}
