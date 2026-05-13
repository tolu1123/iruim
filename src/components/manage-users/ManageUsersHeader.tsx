import CreateUserDialog from "@/components/manage-users/CreateUserDialog";

export default function ManageUsersHeader({role}: {role: string}) {
  return (
    <div
    className="w-full flex flex-row justify-between items-center mb-6"
    >
      <h2 className="font-playfair text-4xl font-bold ">Manage Users</h2>
      {role === "Admin" && <CreateUserDialog />}
    </div>
  )
}