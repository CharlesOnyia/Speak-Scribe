import { Button } from "@/components/ui/button";
import { Pencil, Send, Check, RotateCcw } from "lucide-react";

interface ActionButtonsProps {
  isEditing: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  onReset?: () => void;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
  disabled?: boolean;
}

export function ActionButtons({
  isEditing,
  onEdit,
  onSubmit,
  onReset,
  isSubmitting = false,
  isSubmitted = false,
  disabled = false,
}: ActionButtonsProps) {
  if (isSubmitted) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          Review submitted successfully
        </div>
        {onReset && (
          <Button variant="outline" onClick={onReset} data-testid="button-new-review">
            <RotateCcw className="h-4 w-4 mr-2" />
            Write Another
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-end">
      <Button
        variant="outline"
        onClick={onEdit}
        disabled={disabled || isSubmitting}
        data-testid="button-edit"
      >
        <Pencil className="h-4 w-4 mr-2" />
        {isEditing ? "Done Editing" : "Edit Review"}
      </Button>
      <Button
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        data-testid="button-submit"
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Review
          </>
        )}
      </Button>
    </div>
  );
}
