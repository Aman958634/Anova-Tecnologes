import AdminLayout from '../layouts/AdminLayout';
import AdminResourceManager from '../components/AdminResourceManager';

export default function AdminContacts() {
  return (
    <AdminLayout>
      <AdminResourceManager
        resource="contacts"
        title="Manage Contact Messages"
        description="View incoming contact requests and delete messages after handling them."
      />
    </AdminLayout>
  );
}
