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
        // Agent-specific API URLs
        AGENT1_API_URL = 'http://192.168.52.33:8084'
        AGENT2_API_URL = 'http://192.168.52.84:8084'
        AGENT3_API_URL = 'http://192.168.52.25:8084'
        AGENT4_API_URL = 'http://192.168.52.56:8084'
        AGENT5_API_URL = 'http://192.168.52.117:8084'
    }
    
    stages {
        stage('Deploy to Agents') {
            parallel {
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
                                                    if exist vite rd /s /q vite
                                                    git clone --branch ${BRANCH} ${REPO_URL} vite || exit /b 1
                                                    cd vite
                                                    echo VITE_API_URL=${AGENT1_API_URL} > .env
                                                    npm install
                                                    npm run build
                                                    if exist "${IIS_SITE_PATH}" rd /s /q "${IIS_SITE_PATH}"
                                                    mkdir "${IIS_SITE_PATH}"
                                                    xcopy dist\\* "${IIS_SITE_PATH}\\" /E /I /Y
                                                """
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Similar stages for Agents 2-5...
                // Make sure to update the agent name and AGENT#_API_URL for each
            }
        }
    }
    
    post {
        success {
            echo 'Vite app deployment completed successfully!'
            emailext to: 'demojenkinscicd@gmail.com',
                     subject: "Successful Vite Deployment to ${params.TARGET_AGENT}",
                     body: "Vite application was successfully deployed to selected agents."
        }
        failure {
            echo 'Some deployments may have failed. Check individual stages for details.'
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
