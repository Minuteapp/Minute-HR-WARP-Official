
import React, { useState } from "react";
import { Task, Comment } from "@/types/tasks";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";

interface CommentsTabContentProps {
  task: Task;
  onTaskUpdate: (updates: Partial<Task>) => void;
  readOnly?: boolean;
}

export const CommentsTabContent = ({ task, onTaskUpdate, readOnly = false }: CommentsTabContentProps) => {
  const [newComment, setNewComment] = useState("");
  const currentUser = { id: "current-user", name: "Aktueller Benutzer" };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = () => {
    if (newComment.trim() === "" || readOnly) return;

    const comment: Comment = {
      id: uuidv4(),
      text: newComment.trim(),
      author: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(task.comments || []), comment];
    onTaskUpdate({ comments: updatedComments });
    setNewComment("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !readOnly) {
      handleAddComment();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd. MMMM yyyy, HH:mm", { locale: de });
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {task.comments && task.comments.length > 0 ? (
          task.comments.map((comment) => (
            <div key={comment.id} className="p-3 border rounded-md">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials("User")}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">
                      {comment.author === currentUser.id
                        ? currentUser.name
                        : "Benutzer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            Keine Kommentare vorhanden
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="pt-4 border-t">
          <Textarea
            placeholder="Schreiben Sie einen Kommentar..."
            value={newComment}
            onChange={handleCommentChange}
            onKeyDown={handleKeyPress}
            className="min-h-24 mb-2"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={newComment.trim() === ""}
            >
              <Send className="h-4 w-4 mr-2" />
              Kommentar senden
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-right">
            Drücken Sie Strg+Enter zum Senden
          </div>
        </div>
      )}
    </div>
  );
};
