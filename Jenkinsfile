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
                // Map parameter choices to actual agent names
                def agentMap = [
                    'Agent 1': 'Aslin-agent',
                    'Agent 2': 'Shahana-Agent',
                    'Agent 3': 'Archana-agent',
                    'Agent 4': 'Dharshana-agent',
                    'Agent 5': 'Annie-Agent'
                ]
                
                // Determine targeted agents
                def targetedAgents = []
                if (params.TARGET_AGENT == 'All Agents') {
                    targetedAgents = agentMap.values() as List
                } else {
                    targetedAgents = [agentMap[params.TARGET_AGENT]]
                }

                // Collect results
                def successCount = 0
                def failureCount = 0
                def details = []
                
                targetedAgents.each { agentName ->
                    def resultFile = "deployment-result-${agentName}.txt"
                    def status = "Unknown"
                    if (fileExists(resultFile)) {
                        status = readFile(resultFile).trim()
                    } else {
                        status = "Not Executed"
                    }
                    
                    details << "${agentName}: ${status}"
                    if (status == 'SUCCESS') {
                        successCount++
                    } else {
                        failureCount++
                    }
                }

                // Prepare email content
                def subject = "Deployment Summary - ${currentBuild.currentResult}: ${successCount} Success, ${failureCount} Failure"
                def body = """
                    <h2>Deployment Results for ${params.TARGET_AGENT}</h2>
                    <p><strong>Overall Status:</strong> ${successCount} Successful, ${failureCount} Failed</p>
                    <h3>Detailed Results:</h3>
                    <ul>
                        ${details.collect { "<li>${it}</li>" }.join('\n')}
                    </ul>
                    <p>Build URL: ${env.BUILD_URL}</p>
                """

                // Send summary email
                emailext(
                    to: 'demojenkinscicd@gmail.com,
                    subject: subject,
                    body: body,
                    mimeType: 'text/html'
                )
            }
        }
    }
}

def deployReactAppToAgent(Map args) {
    def (agentLabel, agentName, viteApiUrl) = [args.agentLabel, args.agentName, args.viteApiUrl]
    def deploymentStatus = 'FAILURE'

    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
        if (!isAgentOnline(agentName)) {
            error "${agentName} is offline. Deployment skipped."
        } else {
            node(agentLabel) {
                deleteDir()
                def nodeJS = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                
                withEnv([
                    "PATH+NodeJS=${nodeJS}/bin",
                    "NODE_OPTIONS=--openssl-legacy-provider"
                ]) {
                    dir("build-${agentName}") {
                        unstash 'source-code'
                        writeFile file: '.env', text: "VITE_API_URL=${viteApiUrl}"
                        bat "npm install"
                        bat "npm run build"
                        stash name: "dist-${agentName}", includes: 'dist/**'
                    }

                    timeout(time: 2, unit: 'MINUTES') {
                        dir("deploy-${agentName}") {
                            unstash "dist-${agentName}"
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
            }
            deploymentStatus = 'SUCCESS'
        }
    }
    writeFile file: "deployment-result-${agentName}.txt", text: deploymentStatus
}

@NonCPS
def isAgentOnline(String name) {
    def agent = Jenkins.instance.getNode(name)
    if (agent == null) return false
    def computer = agent.toComputer()
    return computer?.isOnline()
}
