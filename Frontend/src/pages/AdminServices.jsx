import AdminLayout from '../layouts/AdminLayout';
import AdminResourceManager from '../components/AdminResourceManager';

export default function AdminServices() {
  return (
    <AdminLayout>
      <AdminResourceManager
        resource="services"
        title="Manage Services"
        description="Add, update, and remove service cards shown on your website."
      />
    </AdminLayout>
  );
}