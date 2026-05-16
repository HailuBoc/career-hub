// Not used in this app — redirects to home
import { Navigate } from 'react-router-dom'
export default function ProfilePage() {
  return <Navigate to="/" replace />
}
