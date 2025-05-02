pipeline {
    agent { label 'main' }
    parameters {
        choice(name: 'TARGET_AGENT', choices: ['All Agents', 'Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5'], description: 'Select which agent(s) to deploy to')
    }
    environment {
        NODEJS_HOME = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        REPO_URL = 'https://github.com/AslinDhurai/vite.git'
        NODE_OPTIONS = "--openssl-legacy-provider"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', credentialsId: 'git-token', url: "${REPO_URL}"
                stash name: 'source-code', includes: '**/*'
            }
        }

        stage('Deploy to Agents') {
            parallel {
                stage('Deploy to Agent 1') {
                    when { expression { params.TARGET_AGENT == 'Agent 1' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            deployReactAppToAgent(
                                agentLabel: 'windows',
                                agentName: 'Aslin-agent',
                                viteApiUrl: 'http://192.168.52.33:8084'
                            )
                        }
                    }
                }

                stage('Deploy to Agent 2') {
                    when { expression { params.TARGET_AGENT == 'Agent 2' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            deployReactAppToAgent(
                                agentLabel: 'Shahana-Agent',
                                agentName: 'Shahana-Agent',
                                viteApiUrl: 'http://192.168.52.84:8084'
                            )
                        }
                    }
                }

                stage('Deploy to Agent 3') {
                    when { expression { params.TARGET_AGENT == 'Agent 3' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            deployReactAppToAgent(
                                agentLabel: 'Archana-agent',
                                agentName: 'Archana-agent',
                                viteApiUrl: 'http://192.168.52.25:8084'
                            )
                        }
                    }
                }

                stage('Deploy to Agent 4') {
                    when { expression { params.TARGET_AGENT == 'Agent 4' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            deployReactAppToAgent(
                                agentLabel: 'Dharshana-agent',
                                agentName: 'Dharshana-agent',
                                viteApiUrl: 'http://192.168.52.56:8084'
                            )
                        }
                    }
                }

                stage('Deploy to Agent 5') {
                    when { expression { params.TARGET_AGENT == 'Agent 5' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            deployReactAppToAgent(
                                agentLabel: 'Annie-Agent',
                                agentName: 'Annie-Agent',
                                viteApiUrl: 'http://192.168.52.171:8084'
                            )
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Directly collect results from deployment steps
                def deployed = []
                def failed = []

                // Check for deployed and failed status based on files
                if (fileExists("deployed-Aslin-agent.txt")) deployed.add("Aslin-agent")
                if (fileExists("deployed-Shahana-Agent.txt")) deployed.add("Shahana-Agent")
                if (fileExists("deployed-Archana-agent.txt")) deployed.add("Archana-agent")
                if (fileExists("deployed-Dharshana-agent.txt")) deployed.add("Dharshana-agent")
                if (fileExists("deployed-Annie-Agent.txt")) deployed.add("Annie-Agent")

                if (fileExists("failed-Shahana-Agent.txt")) failed.add("Shahana-Agent (offline)")

                // Email the deployment report
                emailext (
                    to: 'demojenkinscicd@gmail.com',
                    subject: "Deployment Summary - ${currentBuild.currentResult}",
                    body: """
                        <h2>Deployment Report</h2>
                        <p><strong>Build:</strong> ${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
                        <p><strong>Status:</strong> ${currentBuild.currentResult}</p>

                        <h3>✅ Successfully Deployed (${deployed.size()})</h3>
                        ${deployed.size() > 0 ? "<ul>${deployed.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No successful deployments</p>"}

                        <h3>❌ Failed Deployments (${failed.size()})</h3>
                        ${failed.size() > 0 ? "<ul>${failed.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No failed deployments</p>"}

                        <p>View full logs: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    mimeType: 'text/html'
                )
            }
        }
    }
}

def deployReactAppToAgent(Map args) {
    def (agentLabel, agentName, viteApiUrl) = [args.agentLabel, args.agentName, args.viteApiUrl]

    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
        if (!isAgentOnline(agentName)) {
            writeFile file: "failed-${agentName}.txt", text: "${agentName} (offline)\n"
            emailext to: 'demojenkinscicd@gmail.com',
                     subject: "Deployment failed: ${agentName} offline",
                     body: "${agentName} is offline, deployment could not proceed."
            error "${agentName} is offline."
        } else {
            node(agentLabel) {
                try {
                    deleteDir()

                    def nodeJS = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'

                    withEnv([ 
                        "PATH+NodeJS=${nodeJS}/bin", 
                        "NODE_OPTIONS=--openssl-legacy-provider"
                    ]) {
                        dir("build-${agentName}") {
                            unstash name: 'source-code'
                            writeFile file: '.env', text: "VITE_API_URL=${viteApiUrl}"
                            bat "type .env"
                            bat "npm install"
                            bat "npm run build"
                            stash name: "dist-${agentName}", includes: 'dist/**'
                        }

                        timeout(time: 2, unit: 'MINUTES') {
                            dir("deploy-${agentName}") {
                                unstash name: "dist-${agentName}"
                                bat """
                                    if exist "C:\\inetpub\\wwwroot\\my-app" (
                                        rd /s /q "C:\\inetpub\\wwwroot\\my-app"
                                    )
                                    mkdir "C:\\inetpub\\wwwroot\\my-app"
                                    xcopy "dist\\*" "C:\\inetpub\\wwwroot\\my-app" /E /I /Y
                                """
                            }
                        }
                    }
                    writeFile file: "deployed-${agentName}.txt", text: "${agentName}\n"
                } catch (Exception e) {
                    writeFile file: "failed-${agentName}.txt", text: "${agentName} (error: ${e.getMessage()})\n"
                    error "Deployment to ${agentName} failed: ${e.getMessage()}"
                }
            }
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
