import LikedList from "./LikedList";
import RecentlyAdded from "./RecentlyAdded";

function FavouritesPage() {
    return (
      <div className="w-5/6 xs:w-5/6 sm:w-5/6 md:w-5/6 lg:w-2/3">
        <RecentlyAdded />
        <LikedList />
      </div>
    );
}

export default FavouritesPage;
