import AdminLayout from '../layouts/AdminLayout';
import AdminResourceManager from '../components/AdminResourceManager';

export default function AdminTeam() {
  return (
    <AdminLayout>
      <AdminResourceManager
        resource="team"
        title="Manage Team Members"
        description="Add, edit, update, and delete team members that appear on the About page."
      />
    </AdminLayout>
  );
}
