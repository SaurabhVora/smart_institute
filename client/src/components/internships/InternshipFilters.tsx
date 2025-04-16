import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InternshipFilters } from "@/types/internship";

interface InternshipFiltersProps {
  filters: InternshipFilters;
  categories: string[];
  types: string[];
  onFiltersChange: (filters: Partial<InternshipFilters>) => void;
}

export function InternshipFilterBar({
  filters,
  categories,
  types,
  onFiltersChange,
}: InternshipFiltersProps) {
  return (
    <div className="bg-gradient-to-br from-[#1E293B] to-[#162032] rounded-xl p-6 shadow-lg border border-gray-800/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="Search by title, company, or skills..."
            className="pl-10 bg-[#0F172A]/80 border-gray-700/50 text-white h-11 rounded-lg focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Categories Dropdown */}
          <div className="relative">
            <Select 
              value={filters.category} 
              onValueChange={(value) => onFiltersChange({ category: value })}
            >
              <SelectTrigger 
                className="w-full sm:w-[180px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-gray-700/50 text-white hover:border-blue-500/50 transition-all duration-300 shadow-md h-11 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mr-2"></div>
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent 
                className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-gray-700/50 text-white shadow-xl rounded-md overflow-hidden"
              >
                {categories.map(category => (
                  <SelectItem 
                    key={category} 
                    value={category}
                    className="hover:bg-blue-500/10 focus:bg-blue-500/10 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      {category === filters.category && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      )}
                      {category}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Types Dropdown */}
          <div className="relative">
            <Select 
              value={filters.type} 
              onValueChange={(value) => onFiltersChange({ type: value })}
            >
              <SelectTrigger 
                className="w-full sm:w-[150px] bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-gray-700/50 text-white hover:border-purple-500/50 transition-all duration-300 shadow-md h-11 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mr-2"></div>
                  <SelectValue placeholder="All Types" />
                </div>
              </SelectTrigger>
              <SelectContent 
                className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-gray-700/50 text-white shadow-xl rounded-md overflow-hidden"
              >
                {types.map(type => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="hover:bg-purple-500/10 focus:bg-purple-500/10 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      {type === filters.type && (
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      )}
                      {type}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-gray-700/50 text-white hover:border-cyan-500/50 hover:bg-[#1E293B]/80 transition-all duration-300 shadow-md h-11 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mr-2"></div>
                  <Filter size={14} className="mr-1" />
                  Sort By
                  <ChevronDown size={14} className="ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-gray-700/50 text-white shadow-xl rounded-md overflow-hidden p-1"
            >
              <DropdownMenuItem 
                onClick={() => onFiltersChange({ sortBy: 'deadline' })} 
                className="cursor-pointer hover:bg-cyan-500/10 focus:bg-cyan-500/10 transition-colors duration-200 rounded-sm px-3 py-2 flex items-center"
              >
                {filters.sortBy === "deadline" && (
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                )}
                Deadline (Earliest)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onFiltersChange({ sortBy: 'stipend' })} 
                className="cursor-pointer hover:bg-cyan-500/10 focus:bg-cyan-500/10 transition-colors duration-200 rounded-sm px-3 py-2 flex items-center"
              >
                {filters.sortBy === "stipend" && (
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                )}
                Stipend (Highest)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onFiltersChange({ sortBy: 'title' })} 
                className="cursor-pointer hover:bg-cyan-500/10 focus:bg-cyan-500/10 transition-colors duration-200 rounded-sm px-3 py-2 flex items-center"
              >
                {filters.sortBy === "title" && (
                  <div className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></div>
                )}
                Title (A-Z)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 