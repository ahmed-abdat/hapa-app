"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  Square, 
  MoreHorizontal, 
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkUpdate: (updates: any) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export function BulkActions({
  selectedIds,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkUpdate,
  onBulkDelete
}: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.warning("Aucune soumission sélectionnée");
      return;
    }

    setIsLoading(true);
    
    try {
      let updates = {};
      let actionName = '';

      switch (action) {
        case 'mark-resolved':
          updates = { submissionStatus: 'resolved' };
          actionName = 'marquées comme résolues';
          break;
        case 'mark-reviewing':
          updates = { submissionStatus: 'reviewing' };
          actionName = 'marquées en révision';
          break;
        case 'mark-dismissed':
          updates = { submissionStatus: 'dismissed' };
          actionName = 'marquées comme rejetées';
          break;
        case 'mark-pending':
          updates = { submissionStatus: 'pending' };
          actionName = 'marquées en attente';
          break;
        case 'priority-high':
          updates = { priority: 'high' };
          actionName = 'marquées priorité haute';
          break;
        case 'priority-medium':
          updates = { priority: 'medium' };
          actionName = 'marquées priorité moyenne';
          break;
        case 'priority-low':
          updates = { priority: 'low' };
          actionName = 'marquées priorité basse';
          break;
        case 'delete':
          if (onBulkDelete) {
            await onBulkDelete(selectedIds);
            toast.success(`${selectedIds.length} soumission(s) supprimée(s)`);
            onDeselectAll();
            return;
          }
          break;
        default:
          return;
      }

      if (Object.keys(updates).length > 0) {
        await onBulkUpdate(updates);
        toast.success(`${selectedIds.length} soumission(s) ${actionName}`);
        onDeselectAll();
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error("Erreur lors de l'action groupée");
    } finally {
      setIsLoading(false);
    }
  };

  const isAllSelected = selectedIds.length === totalCount && totalCount > 0;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < totalCount;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg">
      {/* Selection controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-2"
      >
        {isAllSelected ? (
          <CheckSquare className="h-4 w-4" />
        ) : isSomeSelected ? (
          <div className="relative">
            <Square className="h-4 w-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-primary rounded-sm" />
            </div>
          </div>
        ) : (
          <Square className="h-4 w-4" />
        )}
        <span className="text-sm">
          {selectedIds.length > 0 
            ? `${selectedIds.length} sélectionnée(s)` 
            : 'Tout sélectionner'
          }
        </span>
      </Button>

      {selectedIds.length > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          
          {/* Status actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('mark-resolved')}
              disabled={isLoading}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Résolu
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('mark-reviewing')}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Clock className="h-4 w-4 mr-1" />
              Révision
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBulkAction('mark-dismissed')}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejeté
            </Button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isLoading}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions groupées</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Priority actions */}
              <DropdownMenuItem onClick={() => handleBulkAction('priority-high')}>
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Priorité haute
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('priority-medium')}>
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Priorité moyenne
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('priority-low')}>
                <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                Priorité basse
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction('mark-pending')}>
                <Clock className="h-4 w-4 mr-2" />
                Marquer en attente
              </DropdownMenuItem>
              
              {onBulkDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleBulkAction('delete')}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer sélection
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}