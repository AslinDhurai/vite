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
            steps {
                script {
                    def agents = [
                        [label: 'windows',        name: 'Aslin-agent',     ip: '192.168.52.33',  id: 'agent-1'],
                        [label: 'Shahana-Agent',  name: 'Shahana-Agent',   ip: '192.168.52.84',  id: 'agent-2'],
                        [label: 'Archana-agent',  name: 'Archana-agent',   ip: '192.168.52.25',  id: 'agent-3'],
                        [label: 'Dharshana-agent',name: 'Dharshana-agent', ip: '192.168.52.56',  id: 'agent-4'],
                        [label: 'Annie-Agent',    name: 'Annie-Agent',     ip: '192.168.52.171', id: 'agent-5'],
                    ]

                    def branches = [:]

                    agents.each { agent ->
                        if (params.TARGET_AGENT == 'All Agents' || params.TARGET_AGENT == "Agent ${agent.id[-1]}") {
                            branches["Deploy to ${agent.name}"] = {
                                def result = deployReactAppToAgent(
                                    agentLabel: agent.label,
                                    agentName: agent.name,
                                    viteApiUrl: "http://${agent.ip}:8084"
                                )

                                writeFile file: "deploy-result-${agent.id}.txt", text: result
                                stash name: "deploy-result-${agent.id}", includes: "deploy-result-${agent.id}.txt"
                            }
                        }
                    }

                    parallel branches
                }
            }
        }
    }

//     post {
//         always {
//             script {
//                 def deployed = []
//                 def failed = []

//                 def ids = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5']
//                 ids.each { id ->
//                     def filename = "deploy-result-${id}.txt"
//                     unstash name: "deploy-result-${id}" // will error if the agent wasn't selected
//                     if (fileExists(filename)) {
//                         def result = readFile(filename).trim()
//                         if (result == 'SUCCESS') {
//                             deployed.add(id)
//                         } else {
//                             failed.add(id)
//                         }
//                     }
//                 }

//                 emailext (
//                     to: 'demojenkinscicd@gmail.com',
//                     subject: "Deployment Summary - ${currentBuild.currentResult}",
//                     body: """
//                         <h2>Deployment Report</h2>
//                         <p><strong>Build:</strong> ${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
//                         <p><strong>Status:</strong> ${currentBuild.currentResult}</p>

//                         <h3>✅ Successfully Deployed (${deployed.size()})</h3>
//                         ${deployed ? "<ul>${deployed.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No successful deployments</p>"}

//                         <h3>❌ Failed Deployments (${failed.size()})</h3>
//                         ${failed ? "<ul>${failed.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No failed deployments</p>"}

//                         <p>View full logs: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
//                     """,
//                     mimeType: 'text/html'
//                 )
//             }
//         }
//     }
// }
post {
    always {
        script {
            def deployed = env.DEPLOYED_AGENTS ? env.DEPLOYED_AGENTS.split(',').collect { it.trim() }.findAll { it } : []
            def failed = env.FAILED_AGENTS ? env.FAILED_AGENTS.split(',').collect { it.trim() }.findAll { it } : []

            def deployedCount = deployed.size()
            def failedCount = failed.size()

            emailext (
                to: 'demojenkinscicd@gmail.com',
                subject: "Deployment Summary - ${currentBuild.currentResult}",
                body: """
                    <html>
                    <body>
                        <h2>Deployment Report</h2>
                        <p><strong>Build:</strong> ${env.JOB_NAME} #${env.BUILD_NUMBER}</p>
                        <p><strong>Status:</strong> ${currentBuild.currentResult}</p>
                        
                        <h3 style="color:green;">✅ Successfully Deployed Agents: ${deployedCount}</h3>
                        ${deployedCount > 0 ? "<ul>${deployed.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No successful deployments</p>"}
                        
                        <h3 style="color:red;">❌ Failed Deployments: ${failedCount}</h3>
                        ${failedCount > 0 ? "<ul>${failed.collect { "<li>${it}</li>" }.join('')}</ul>" : "<p>No failed deployments</p>"}
                        
                        <p><a href="${env.BUILD_URL}">View Full Build Logs</a></p>
                    </body>
                    </html>
                """,
                mimeType: 'text/html'
            )
        }
    }
}

def deployReactAppToAgent(Map args) {
    def (agentLabel, agentName, viteApiUrl) = [args.agentLabel, args.agentName, args.viteApiUrl]

    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
        if (!isAgentOnline(agentName)) {
            return 'FAILED'
        }

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
                return 'SUCCESS'
            } catch (Exception e) {
                echo "Deployment failed for ${agentName}: ${e}"
                return 'FAILED'
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
