import { execSync } from 'child_process'

execSync('react-router build', { stdio: 'inherit' })

