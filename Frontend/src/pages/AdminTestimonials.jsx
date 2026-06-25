import AdminLayout from '../layouts/AdminLayout';
import AdminResourceManager from '../components/AdminResourceManager';

export default function AdminTestimonials() {
  return (
    <AdminLayout>
      <AdminResourceManager
        resource="testimonials"
        title="Manage Client Testimonials"
        description="Add clients for the home page testimonial cards with name, role, review, rating, and photo."
      />
    </AdminLayout>
  );
}
