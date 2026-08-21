export default function GuestAlert() {
  return (
    <div className="page-container flex flex-col w-full my-4 z-100">
      <div className=" bg-purple-soft text-white text-sm px-4 py-2 rounded-lg ">
        <p className="text-center">
          You are using <span className="font-semibold">PyPhos</span> as a
          guest. To create multiple projects,{" "}
          <a
            href="/login"
            className="text-white hover:text-foreground hover:cursor-pointer hover:underline underline-offset-2"
          >
            log in
          </a>{" "}
          or{" "}
          <a
            href="/signup"
            className="text-white hover:text-foreground hover:cursor-pointer hover:underline underline-offset-2"
          >
            sign up.
          </a>
        </p>
      </div>
    </div>
  );
}
