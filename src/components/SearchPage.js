import SearchBar from "./SearchBar";
import RecentlyPlayed from "./RecentlyPlayed";
import List from "./List";

function SearchPage({ searchTerm, setSearchTerm, patchInfo, setPatchNumber }) {
    return (
      <div className="w-5/6 xs:w-5/6 sm:w-5/6 md:w-2/3 lg:w-2/3">
        <SearchBar setSearchTerm={setSearchTerm} />
        <RecentlyPlayed searchTerm={searchTerm} />
        <List
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          patchInfo={patchInfo}
          setPatchNumber={(number) => setPatchNumber(number)}
        />
      </div>
    );
}

export default SearchPage;
