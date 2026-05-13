export default function EventStatCard({title, count}: {title: string, count: number}) {
  //Format title to replace underscores with spaces
  if (title.includes("_")) {
    title = title.replace(/_/g, " ");
    
    // If title ends with not, remove it and add not in front of it
    if (title.endsWith(" not")) {
      title = "Not " + title.slice(0, -4);
    }

    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  return (
    <div className='flex flex-col gap-4 bg-white text-black shadow-sm rounded-lg p-5'>
      <p className=''>{title}</p>
      <p className=''>{count}</p>
    </div>
  )
}