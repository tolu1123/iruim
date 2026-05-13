import getUserData from "@/actions/getUserData"
import ManageUsersContainer from "@/components/manage-users/ManageUsersContainer";
import ManageUsersHeader from "@/components/manage-users/ManageUsersHeader"
import { User } from "@/components/manage-users/ManageUsersContainer";

import { createClient } from "@/lib/supabase/server";


async function page() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*");
  const userData = await getUserData();
  const users = data as User[];

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <ManageUsersHeader role={userData[0].role} />
      <ManageUsersContainer role={userData[0].role} users={users} />
    </div>
  )
}

export default page