import { getEvents } from "@/actions/events";
import getUserData from "@/actions/getUserData";
import Stats from "@/components/dashboard/Stats";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import PastEvents from "@/components/events/PastEvents";

import { createClient } from "@/lib/supabase/server";
import { User } from "@/components/manage-users/ManageUsersContainer";
import { filterEventsByDate } from "@/lib/events/filterEventsByDate";
import WhatsApp from "@/components/dashboard/WhatsApp";

async function page() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*");
  const userData = await getUserData();
  const events = await getEvents();
  const users = data as User[];
  const adminNo = users.filter((user) => user.role === "Admin").length;
  const managerNo = users.filter((user) => user.role === "Manager").length;
  const { upcoming, past } = filterEventsByDate(events);
 

  return (
    <div className='flex flex-1 flex-col gap-4 p-4'>
      <h1 className='font-playfair text-4xl font-bold mb-7'>
        {userData[0].role} {userData[0].name}
      </h1>
      <Stats adminNo={adminNo} managerNo={managerNo} />
      <UpcomingEvents events={upcoming} />
      <PastEvents events={past} />
      {/* Only Admins can see this component */}
      {userData[0].role === "Admin" && <WhatsApp />}
    </div>
  );
}

export default page;
