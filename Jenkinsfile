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
                            def result = deployReactAppToAgent(
                                agentLabel: 'windows',
                                agentName: 'Aslin-agent',
                                viteApiUrl: 'http://192.168.52.33:8084'
                            )
                            addToDeploymentSummary(result)
                        }
                    }
                }

                stage('Deploy to Agent 2') {
                    when { expression { params.TARGET_AGENT == 'Agent 2' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            def result = deployReactAppToAgent(
                                agentLabel: 'Shahana-Agent',
                                agentName: 'Shahana-Agent',
                                viteApiUrl: 'http://192.168.52.84:8084'
                            )
                            addToDeploymentSummary(result)
                        }
                    }
                }

                stage('Deploy to Agent 3') {
                    when { expression { params.TARGET_AGENT == 'Agent 3' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            def result = deployReactAppToAgent(
                                agentLabel: 'Archana-agent',
                                agentName: 'Archana-agent',
                                viteApiUrl: 'http://192.168.52.25:8084'
                            )
                            addToDeploymentSummary(result)
                        }
                    }
                }

                stage('Deploy to Agent 4') {
                    when { expression { params.TARGET_AGENT == 'Agent 4' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            def result = deployReactAppToAgent(
                                agentLabel: 'Dharshana-agent',
                                agentName: 'Dharshana-agent',
                                viteApiUrl: 'http://192.168.52.56:8084'
                            )
                            addToDeploymentSummary(result)
                        }
                    }
                }

                stage('Deploy to Agent 5') {
                    when { expression { params.TARGET_AGENT == 'Agent 5' || params.TARGET_AGENT == 'All Agents' } }
                    steps {
                        script {
                            def result = deployReactAppToAgent(
                                agentLabel: 'Annie-Agent',
                                agentName: 'Annie-Agent',
                                viteApiUrl: 'http://192.168.52.171:8084'
                            )
                            addToDeploymentSummary(result)
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def summary = getDeploymentSummary()
                emailext (
                    to: 'demojenkinscicd@gmail.com',
                    subject: "Deployment Summary - ${currentBuild.currentResult}",
                    body: """
                        <h2>Deployment Report</h2>
                        <p><strong>Build:</strong> ${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
                        <p><strong>Status:</strong> ${currentBuild.currentResult}</p>
                        
                        <h3>✅ Successfully Deployed (${summary.successCount})</h3>
                        ${summary.successfulAgents ? "<ul>${summary.successfulAgents.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No successful deployments</p>"}
                        
                        <h3>❌ Failed Deployments (${summary.failedCount})</h3>
                        ${summary.failedAgents ? "<ul>${summary.failedAgents.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No failed deployments</p>"}
                        
                        <p>View full logs: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    """,
                    mimeType: 'text/html'
                )
            }
        }
    }
}

// Deployment tracking map stored as a global variable
def deploymentSummary = [
    successfulAgents: [],
    failedAgents: []
]

def addToDeploymentSummary(result) {
    if (result.success) {
        deploymentSummary.successfulAgents.add(result.agentName)
    } else {
        deploymentSummary.failedAgents.add("${result.agentName} (${result.reason})")
    }
}

def getDeploymentSummary() {
    return [
        successCount: deploymentSummary.successfulAgents.size(),
        failedCount: deploymentSummary.failedAgents.size(),
        successfulAgents: deploymentSummary.successfulAgents,
        failedAgents: deploymentSummary.failedAgents
    ]
}

def deployReactAppToAgent(Map args) {
    def (agentLabel, agentName, viteApiUrl) = [args.agentLabel, args.agentName, args.viteApiUrl]
    
    try {
        if (!isAgentOnline(agentName)) {
            return [success: false, agentName: agentName, reason: "offline"]
        } else {
            node(agentLabel) {
                // Clean workspace before starting
                deleteDir()
                
                // Get NodeJS installation on the target agent
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
                return [success: true, agentName: agentName]
            }
        }
    } catch (Exception e) {
        return [success: false, agentName: agentName, reason: e.getMessage()]
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
