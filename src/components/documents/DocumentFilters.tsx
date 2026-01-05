import { useState } from "react";
import { Calendar, Tag, User, FileType, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DocumentFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const DocumentFilters = ({ onFiltersChange }: DocumentFiltersProps) => {
  const [filters, setFilters] = useState({
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
    fileTypes: [] as string[],
    tags: [] as string[],
    authors: [] as string[],
    sizeRange: {
      min: '',
      max: '',
    },
    hasExpiry: null as boolean | null,
    requiresSignature: null as boolean | null,
    visibilityLevel: 'all',
  });

  const fileTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word (DOCX)' },
    { value: 'doc', label: 'Word (DOC)' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'xls', label: 'Excel (XLS)' },
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'txt', label: 'Text' },
  ];

  const visibilityLevels = [
    { value: 'all', label: 'Alle Sichtbarkeiten' },
    { value: 'private', label: 'Privat' },
    { value: 'team', label: 'Team' },
    { value: 'department', label: 'Abteilung' },
    { value: 'company', label: 'Unternehmen' },
  ];

  const updateFilters = (newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const addFileType = (fileType: string) => {
    if (!filters.fileTypes.includes(fileType)) {
      updateFilters({
        fileTypes: [...filters.fileTypes, fileType]
      });
    }
  };

  const removeFileType = (fileType: string) => {
    updateFilters({
      fileTypes: filters.fileTypes.filter(ft => ft !== fileType)
    });
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !filters.tags.includes(trimmedTag)) {
      updateFilters({
        tags: [...filters.tags, trimmedTag]
      });
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({
      tags: filters.tags.filter(t => t !== tag)
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      dateRange: {
        from: null,
        to: null,
      },
      fileTypes: [],
      tags: [],
      authors: [],
      sizeRange: {
        min: '',
        max: '',
      },
      hasExpiry: null,
      requiresSignature: null,
      visibilityLevel: 'all',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.fileTypes.length > 0 ||
      filters.tags.length > 0 ||
      filters.authors.length > 0 ||
      filters.sizeRange.min ||
      filters.sizeRange.max ||
      filters.hasExpiry !== null ||
      filters.requiresSignature !== null ||
      filters.visibilityLevel !== 'all'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Erweiterte Filter</h3>
        </div>
        {hasActiveFilters() && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Filter zurücksetzen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Datums-Filter */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Erstellungsdatum</span>
          </Label>
          <div className="space-y-2">
            <Input
              type="date"
              value={filters.dateRange.from?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateFilters({
                dateRange: { ...filters.dateRange, from: e.target.value ? new Date(e.target.value) : null }
              })}
              placeholder="Von"
            />
            <Input
              type="date"
              value={filters.dateRange.to?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateFilters({
                dateRange: { ...filters.dateRange, to: e.target.value ? new Date(e.target.value) : null }
              })}
              placeholder="Bis"
            />
          </div>
        </div>

        {/* Dateityp-Filter */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <FileType className="h-4 w-4" />
            <span>Dateitypen</span>
          </Label>
          <Select onValueChange={addFileType}>
            <SelectTrigger>
              <SelectValue placeholder="Dateityp hinzufügen" />
            </SelectTrigger>
            <SelectContent>
              {fileTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1">
            {filters.fileTypes.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeFileType(type)}
              >
                {type.toUpperCase()}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Tag-Filter */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Tags</span>
          </Label>
          <Input
            placeholder="Tag eingeben und Enter drücken"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="flex flex-wrap gap-1">
            {filters.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Dateigröße */}
        <div className="space-y-3">
          <Label>Dateigröße (MB)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.sizeRange.min}
              onChange={(e) => updateFilters({
                sizeRange: { ...filters.sizeRange, min: e.target.value }
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.sizeRange.max}
              onChange={(e) => updateFilters({
                sizeRange: { ...filters.sizeRange, max: e.target.value }
              })}
            />
          </div>
        </div>

        {/* Sichtbarkeit */}
        <div className="space-y-3">
          <Label>Sichtbarkeit</Label>
          <Select 
            value={filters.visibilityLevel} 
            onValueChange={(value) => updateFilters({ visibilityLevel: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Besondere Eigenschaften */}
        <div className="space-y-3">
          <Label>Besondere Eigenschaften</Label>
          <div className="space-y-2">
            <Select 
              value={filters.hasExpiry === null ? 'all' : filters.hasExpiry.toString()} 
              onValueChange={(value) => updateFilters({ 
                hasExpiry: value === 'all' ? null : value === 'true' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Dokumente</SelectItem>
                <SelectItem value="true">Mit Ablaufdatum</SelectItem>
                <SelectItem value="false">Ohne Ablaufdatum</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.requiresSignature === null ? 'all' : filters.requiresSignature.toString()} 
              onValueChange={(value) => updateFilters({ 
                requiresSignature: value === 'all' ? null : value === 'true' 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Dokumente</SelectItem>
                <SelectItem value="true">Signatur erforderlich</SelectItem>
                <SelectItem value="false">Keine Signatur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Aktive Filter anzeigen */}
      {hasActiveFilters() && (
        <>
          <Separator />
          <div>
            <Label className="text-sm font-medium mb-2 block">Aktive Filter:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.dateRange.from && (
                <Badge variant="outline">
                  Von: {filters.dateRange.from.toLocaleDateString('de-DE')}
                </Badge>
              )}
              {filters.dateRange.to && (
                <Badge variant="outline">
                  Bis: {filters.dateRange.to.toLocaleDateString('de-DE')}
                </Badge>
              )}
              {filters.fileTypes.map((type) => (
                <Badge key={`filter-${type}`} variant="outline">
                  Typ: {type.toUpperCase()}
                </Badge>
              ))}
              {filters.tags.map((tag) => (
                <Badge key={`filter-tag-${tag}`} variant="outline">
                  Tag: {tag}
                </Badge>
              ))}
              {filters.sizeRange.min && (
                <Badge variant="outline">
                  Min: {filters.sizeRange.min}MB
                </Badge>
              )}
              {filters.sizeRange.max && (
                <Badge variant="outline">
                  Max: {filters.sizeRange.max}MB
                </Badge>
              )}
              {filters.visibilityLevel !== 'all' && (
                <Badge variant="outline">
                  Sichtbarkeit: {filters.visibilityLevel}
                </Badge>
              )}
              {filters.hasExpiry !== null && (
                <Badge variant="outline">
                  {filters.hasExpiry ? 'Mit Ablaufdatum' : 'Ohne Ablaufdatum'}
                </Badge>
              )}
              {filters.requiresSignature !== null && (
                <Badge variant="outline">
                  {filters.requiresSignature ? 'Signatur erforderlich' : 'Keine Signatur'}
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentFilters;