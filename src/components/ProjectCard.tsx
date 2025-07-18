import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Project } from "@/pages/Index";
import { EditProjectModal } from "@/components/EditProjectModal";
import { ProjectDetailsModal } from "@/components/ProjectDetailsModal";
import { MoreHorizontal, Calendar, Users, Eye, Edit, Trash2, AlertCircle } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard = ({ project, onUpdate, onDelete }: ProjectCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in-progress": return "Em Andamento";
      case "review": return "Em Revisão";
      default: return "Planejamento";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      default: return "Baixa";
    }
  };

  const isOverdue = new Date(project.deliveryDate) < new Date() && project.status !== "completed";
  const isHighPriority = project.priority === "high";

  // Lógica para determinar qual badge mostrar (prioridade: CRÍTICO > ATRASADO > ALTA PRIORIDADE)
  const getAlertBadge = () => {
    if (isHighPriority && isOverdue) {
      return (
        <Badge className="bg-red-700 text-white">
          <AlertCircle className="w-3 h-3 mr-1" />
          CRÍTICO
        </Badge>
      );
    } else if (isOverdue) {
      return (
        <Badge className="bg-orange-500 text-white">
          <AlertCircle className="w-3 h-3 mr-1" />
          ATRASADO
        </Badge>
      );
    } else if (isHighPriority) {
      return (
        <Badge className="bg-red-500 text-white">
          <AlertCircle className="w-3 h-3 mr-1" />
          ALTA PRIORIDADE
        </Badge>
      );
    }
    return null;
  };

  const handleEdit = (updatedProject: Project) => {
    onUpdate(updatedProject);
    setIsEditModalOpen(false);
  };

  const cardClasses = `
    bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 
    ${isHighPriority ? 'border-l-red-500' : 'border-l-blue-500'}
    relative overflow-hidden
  `.trim();

  return (
    <>
      <Card className={cardClasses}>
        {/* Alert Badge - Apenas uma badge por vez */}
        <div className="absolute top-2 right-2 z-10">
          {getAlertBadge()}
        </div>

        <CardHeader className="pb-3 relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {project.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsEditModalOpen(true)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="cursor-pointer text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
            <Badge className={getPriorityColor(project.priority)}>
              {getPriorityText(project.priority)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progresso</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Delivery Date */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Entrega: {format(new Date(project.deliveryDate), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>

          {/* Allocations */}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{project.allocations.length} pessoa(s) alocada(s)</span>
          </div>

          {/* Allocations List */}
          <div className="flex flex-wrap gap-1">
            {project.allocations.slice(0, 3).map((person, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {person}
              </Badge>
            ))}
            {project.allocations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.allocations.length - 3}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDetailsModalOpen(true)}
            className="w-full mt-4"
          >
            Ver Detalhes
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <EditProjectModal
          project={project}
          onUpdate={handleEdit}
        />
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <ProjectDetailsModal 
          project={project} 
          onUpdate={onUpdate}
        />
      </Dialog>
    </>
  );
};