import { useState } from "react";
import "react-latex-editor/styles";
import { Sparkles, Wand2, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { useEquationStore } from "@/store/equationStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EquationEditor() {
  const [content, setContent] = useState("<p>Start typing...</p>");
  const [rawInput, setRawInput] = useState("");
  const [sourceFormat, setSourceFormat] = useState("plaintext");
  const [targetFormat, setTargetFormat] = useState("latex");

  const {
    convertEquation,
    simplifyEquation,
    solveEquation,
    validateEquation,
    isLoading,
    error,
  } = useEquationStore();

  const handleConvert = async () => {
    if (!rawInput.trim()) {
      toast.error("Please enter an equation to convert");
      return;
    }

    try {
      const result = await convertEquation(
        rawInput,
        sourceFormat,
        targetFormat,
      );
      setContent(`<p>${result.convertedEquation}</p>`);
      toast.success(
        `Equation converted from ${sourceFormat} to ${targetFormat}!`,
      );
    } catch (error) {
      toast.error("Failed to convert equation");
      console.error(error);
    }
  };

  const handleSimplify = async () => {
    if (!rawInput.trim()) {
      toast.error("Please enter an equation to simplify");
      return;
    }

    try {
      const result = await simplifyEquation(rawInput, true);
      setContent(`<p>${result.simplifiedEquation}</p>`);
      toast.success("Equation simplified!");
    } catch (error) {
      toast.error("Failed to simplify equation");
      console.error(error);
    }
  };

  const handleSolve = async () => {
    if (!rawInput.trim()) {
      toast.error("Please enter an equation to solve");
      return;
    }

    try {
      const result = await solveEquation(rawInput, undefined, true);
      setContent(`<p>${result.solution}</p>`);
      toast.success("Equation solved!");
    } catch (error) {
      toast.error("Failed to solve equation");
      console.error(error);
    }
  };

  const handleValidate = async () => {
    if (!rawInput.trim()) {
      toast.error("Please enter an equation to validate");
      return;
    }

    try {
      const result = await validateEquation(rawInput, sourceFormat);
      setContent(`<p>${result.validation}</p>`);
      toast.success("Equation validated!");
    } catch (error) {
      toast.error("Failed to validate equation");
      console.error(error);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] relative flex flex-col gap-4">
      {/* Equation Tools Section */}
      <Card className="p-4 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-sm">Equation Tools</h3>
          </div>

          <Textarea
            placeholder="Enter your equation (e.g., 'x^2 + 2x + 1', 'integral of x dx', LaTeX code, etc.)..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="min-h-[80px] text-sm"
          />

          <div className="flex gap-2 items-center flex-wrap">
            <Select value={sourceFormat} onValueChange={setSourceFormat}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latex">LaTeX</SelectItem>
                <SelectItem value="mathml">MathML</SelectItem>
                <SelectItem value="asciimath">AsciiMath</SelectItem>
                <SelectItem value="unicode">Unicode</SelectItem>
                <SelectItem value="plaintext">Plain Text</SelectItem>
              </SelectContent>
            </Select>

            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />

            <Select value={targetFormat} onValueChange={setTargetFormat}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latex">LaTeX</SelectItem>
                <SelectItem value="mathml">MathML</SelectItem>
                <SelectItem value="asciimath">AsciiMath</SelectItem>
                <SelectItem value="unicode">Unicode</SelectItem>
                <SelectItem value="plaintext">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleConvert}
              disabled={isLoading || !rawInput.trim()}
              size="sm"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <ArrowRightLeft className="h-4 w-4 animate-pulse" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4" />
                  Convert
                </>
              )}
            </Button>

            <Button
              onClick={handleSimplify}
              disabled={isLoading || !rawInput.trim()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Simplify
            </Button>

            <Button
              onClick={handleSolve}
              disabled={isLoading || !rawInput.trim()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Solve
            </Button>

            <Button
              onClick={handleValidate}
              disabled={isLoading || !rawInput.trim()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              Validate
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </Card>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <div className="h-full border rounded-lg p-4 bg-white dark:bg-gray-900">
          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>
    </div>
  );
}
