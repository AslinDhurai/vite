pipeline {
    agent {
        label 'windows' // Use a Windows agent with Node.js and IIS
    }

    environment {
        REPO_URL = 'https://github.com/your-username/your-repo.git'
        BRANCH = 'main'
        IIS_SITE_PATH = 'C:\\inetpub\\wwwroot\\my-app' // IIS website physical path
    }

    stages {
        stage('Checkout') {
            steps {
                git(
                    url: env.REPO_URL,
                    branch: env.BRANCH,
                    credentialsId: 'git-token' // Create in Jenkins Credentials
                )
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build' // Assumes "build" script in package.json
            }
        }

        stage('Deploy to IIS') {
            steps {
                // Stop IIS site (optional)
                bat 'appcmd stop site "Default Web Site"'

                // Delete old files
                bat "if exist ${IIS_SITE_PATH} rmdir /s /q ${IIS_SITE_PATH}"

                // Create directory if not exists
                bat "mkdir ${IIS_SITE_PATH}"

                // Copy built files (assuming build outputs to 'dist' folder)
                bat "xcopy /E /Y dist\\* ${IIS_SITE_PATH}\\"

                // Start IIS site
                bat 'appcmd start site "Default Web Site"'
            }
        }
    }

    post {
        success {
            echo 'Deployment to IIS completed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
