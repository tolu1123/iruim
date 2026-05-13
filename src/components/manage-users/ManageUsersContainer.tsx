import CreateUserForm from "@/components/manage-users/CreateUserForm";
import UsersTable from "@/components/manage-users/UsersTable";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

function ManageUsersContainer({ role, users }: { role: string, users: User[] }) {
  return (
    <main className='flex flex-col lg:grid lg:grid-cols-2 gap-5'>
      <section className=''>
        <UsersTable users={users} role={role} />
      </section>
      {role === "Admin" && (
        <section className='hidden lg:flex lg:justify-center'>
          <CreateUserForm />
        </section>
      )}
    </main>
  );
}

export default ManageUsersContainer;
