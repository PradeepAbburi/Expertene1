import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Tag, User } from 'lucide-react';

interface SearchResult {
  type: 'user' | 'tag';
  id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  tag?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5);

      if (users) {
        searchResults.push(
          ...users.map((user) => ({
            type: 'user' as const,
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
          }))
        );
      }

      // Search tags
      const { data: tagArticles } = await supabase
        .from('articles')
        .select('tags')
        .eq('is_published', true);

      if (tagArticles) {
        const uniqueTags = new Set<string>();
        tagArticles.forEach((article) => {
          article.tags?.forEach((tag: string) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              uniqueTags.add(tag);
            }
          });
        });

        searchResults.push(
          ...Array.from(uniqueTags).slice(0, 5).map((tag) => ({
            type: 'tag' as const,
            id: tag,
            tag,
          }))
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'user') {
      navigate(`/profile/${result.username}`);
    }
    setShowResults(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search accounts, tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          className="pl-10 h-9"
        />
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-lg">
          <div className="py-2">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
              >
                {result.type === 'user' && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={result.avatar_url} />
                      <AvatarFallback>
                        {result.display_name?.charAt(0) || result.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.display_name || result.username}</p>
                      <p className="text-xs text-muted-foreground truncate">@{result.username}</p>
                    </div>
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </>
                )}
                {result.type === 'tag' && (
                  <>
                    <Tag className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Badge variant="secondary" className="text-sm">
                        #{result.tag}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
