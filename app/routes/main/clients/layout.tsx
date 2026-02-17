import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="page-content h-full">
      <Outlet />
    </div>
  )
}
