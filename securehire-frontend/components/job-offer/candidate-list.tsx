import { useState, useEffect } from 'react'
import { Candidate } from "@/types/job-offer"
import { CandidateCard } from "./candidate-card"
import { FavoriteToggle } from "./favorite-toggle"

interface CandidateListProps {
  busquedaId: string;
  onCandidateSelect: (candidate: Candidate) => void;
  selectedCandidate?: Candidate;
}

export function CandidateList({ busquedaId, onCandidateSelect, selectedCandidate }: CandidateListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async (favoritesOnly: boolean = false) => {
    setLoading(true);
    try {
      const url = favoritesOnly 
        ? `http://localhost:8080/api/postulaciones/busqueda/${busquedaId}/favoritos`
        : `http://localhost:8080/api/postulaciones/busqueda/${busquedaId}`;

      const response = await fetch(url, {
        credentials: "include",
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error al cargar candidatos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(showOnlyFavorites);
  }, [busquedaId, showOnlyFavorites]);

  const handleFavoriteChange = async (candidateId: string, isFavorite: boolean) => {
    if (showOnlyFavorites && !isFavorite) {
      // Si estamos mostrando solo favoritos y se quita el favorito, actualizamos la lista
      setCandidates(prev => prev.filter(c => c.postulacion.id !== candidateId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FavoriteToggle 
          showOnlyFavorites={showOnlyFavorites}
          onToggle={() => setShowOnlyFavorites(!showOnlyFavorites)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {showOnlyFavorites 
            ? "No hay candidatos favoritos"
            : "No hay candidatos para mostrar"}
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.postulacion.id}
              candidate={candidate}
              isSelected={selectedCandidate?.postulacion.id === candidate.postulacion.id}
              onClick={onCandidateSelect}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      )}
    </div>
  )
} 