import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, ArrowLeft, Sparkles, Loader2, ShoppingCart, Check, PackagePlus, Maximize2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sofa } from "@/data/sofas";
import { Accessory } from "@/data/accessories";

export type FeedbackValue = "like" | "dislike";

interface ResultViewProps {
  resultImage: string;
  sofa: Sofa;
  onTryAnother: () => void;
  score: number | null;
  scoreComment: string | null;
  isScoring?: boolean;
  isEnhancing: boolean;
  enhanced: boolean;
  suggestedAccessories: Accessory[];
  cart: Accessory[];
  sofaInCart: boolean;
  onEnhance: () => void;
  onAddToCart: (accessory: Accessory) => void;
  onAddSofaToCart: () => void;
  onAddBundleToCart: () => void;
  feedbackGiven: FeedbackValue | null;
  feedbackDisabled?: boolean;
  onFeedback: (value: FeedbackValue, comment?: string) => Promise<void> | void;
}

const scoreColor = (score: number) => {
  if (score >= 8) return "text-primary";
  if (score >= 6) return "text-foreground";
  return "text-muted-foreground";
};

const ResultView = ({
  resultImage,
  sofa,
  onTryAnother,
  score,
  scoreComment,
  isScoring,
  isEnhancing,
  enhanced,
  suggestedAccessories,
  cart,
  sofaInCart,
  onEnhance,
  onAddToCart,
  onAddSofaToCart,
  onAddBundleToCart,
  feedbackGiven,
  feedbackDisabled,
  onFeedback,
}: ResultViewProps) => {
  const { t, i18n } = useTranslation();
  const formatPrice = (price: number) => {
    const locale = i18n.language === "en" ? "en-US" : "ru-RU";
    return new Intl.NumberFormat(locale).format(price) + " ₽";
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `divan-${sofa.id}-interior.png`;
    link.click();
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<FeedbackValue | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!pendingFeedback) return;
    setSubmittingFeedback(true);
    try {
      await onFeedback(pendingFeedback, feedbackComment.trim() || undefined);
      setPendingFeedback(null);
      setFeedbackComment("");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleQuickFeedback = async (value: FeedbackValue) => {
    setPendingFeedback(value);
  };

  const totalPrice =
    (sofaInCart ? sofa.price : 0) + cart.reduce((sum, a) => sum + a.price, 0);
  const cartCount = cart.length + (sofaInCart ? 1 : 0);
  const inCart = (id: string) => cart.some((a) => a.id === id);

  const allAccessoriesInCart =
    suggestedAccessories.length > 0 &&
    suggestedAccessories.every((a) => inCart(a.id));
  const bundleInCart = sofaInCart && allAccessoriesInCart;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border shadow-lg relative bg-muted flex items-center justify-center max-h-[50vh] sm:max-h-[60vh]">
        <img
          src={resultImage}
          alt={t("result.imgAlt")}
          onClick={() => setIsFullscreen(true)}
          className="w-full h-full max-h-[50vh] sm:max-h-[60vh] object-contain cursor-zoom-in"
        />
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
          aria-label={t("result.openFullscreen")}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        {isEnhancing && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-sm font-medium text-foreground">{t("result.enhancing")}</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] max-h-[95vh] p-2 sm:p-4 bg-background">
          <img
            src={resultImage}
            alt={t("result.imgAlt")}
            className="w-full h-auto max-h-[90vh] object-contain rounded-md"
          />
        </DialogContent>
      </Dialog>

      {/* Score block */}
      {(score !== null || isScoring) && (
        <div className="p-5 rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/20 space-y-3">
          <div className="flex items-start gap-4">
            <div className="shrink-0 h-16 w-16 rounded-2xl bg-background border-2 border-primary/30 flex items-center justify-center">
              {score !== null ? (
                <span className={`text-2xl font-bold ${scoreColor(score)}`}>
                  {score.toFixed(1)}
                </span>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                {t("result.scoreLabel")}
              </p>
              {score !== null ? (
                <p className="text-sm text-foreground mt-1">{scoreComment}</p>
              ) : (
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              )}
            </div>
          </div>
          {!enhanced && (
            <Button
              onClick={onEnhance}
              disabled={isEnhancing || isScoring}
              className="w-full"
              variant="default"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("result.pickingAccessories")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("result.enhanceCta")}
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Feedback block */}
      <div className="p-4 rounded-xl border bg-card space-y-3">
        {feedbackGiven ? (
          <div className="flex items-center gap-2 text-sm text-foreground">
            {feedbackGiven === "like" ? (
              <ThumbsUp className="h-4 w-4 text-primary" />
            ) : (
              <ThumbsDown className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{t("result.feedbackThanks")}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm font-medium text-foreground">
                {enhanced ? t("result.feedbackQuestionEnhanced") : t("result.feedbackQuestion")}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={pendingFeedback === "like" ? "default" : "outline"}
                  size="sm"
                  disabled={feedbackDisabled || submittingFeedback}
                  onClick={() => handleQuickFeedback("like")}
                >
                  <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                  {t("result.like")}
                </Button>
                <Button
                  variant={pendingFeedback === "dislike" ? "default" : "outline"}
                  size="sm"
                  disabled={feedbackDisabled || submittingFeedback}
                  onClick={() => handleQuickFeedback("dislike")}
                >
                  <ThumbsDown className="mr-1.5 h-3.5 w-3.5" />
                  {t("result.dislike")}
                </Button>
              </div>
            </div>
            {pendingFeedback && (
              <div className="space-y-2">
                <Textarea
                  placeholder={
                    pendingFeedback === "dislike"
                      ? t("result.commentDislike")
                      : t("result.commentLike")
                  }
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value.slice(0, 500))}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPendingFeedback(null);
                      setFeedbackComment("");
                    }}
                    disabled={submittingFeedback}
                  >
                    {t("result.cancel")}
                  </Button>
                  <Button size="sm" onClick={handleSubmitFeedback} disabled={submittingFeedback}>
                    {submittingFeedback ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        {t("result.submitting")}
                      </>
                    ) : (
                      t("result.submit")
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sofa info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 border">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{sofa.name}</h3>
          <p className="text-muted-foreground text-sm">{sofa.description}</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {formatPrice(sofa.price)}
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            {t("result.download")}
          </Button>
          <Button onClick={onAddSofaToCart} disabled={sofaInCart}>
            {sofaInCart ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t("result.inCart")}
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {t("result.addToCart")}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggested accessories */}
      {suggestedAccessories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-foreground">{t("result.suggested")}</h3>
            <div className="flex items-center gap-2">
              {cartCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount}
                </div>
              )}
              <Button
                size="sm"
                variant={bundleInCart ? "secondary" : "default"}
                onClick={onAddBundleToCart}
                disabled={bundleInCart}
              >
                {bundleInCart ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    {t("result.bundleInCart")}
                  </>
                ) : (
                  <>
                    <PackagePlus className="mr-1.5 h-3.5 w-3.5" />
                    {t("result.addBundle")}
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedAccessories.map((acc) => {
              const added = inCart(acc.id);
              return (
                <div
                  key={acc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="h-14 w-14 rounded-md bg-muted overflow-hidden shrink-0">
                    <img src={acc.image} alt={acc.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(acc.price)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={added ? "secondary" : "outline"}
                    onClick={() => onAddToCart(acc)}
                    className="shrink-0"
                    disabled={added}
                  >
                    {added ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        {t("result.inCart")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                        {t("result.addToCart")}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {cartCount > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
              <span className="font-semibold text-foreground">{t("result.totalInCart")}</span>
              <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
            </div>
          )}
        </div>
      )}

      <Button variant="ghost" onClick={onTryAnother} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("result.tryAnother")}
      </Button>
    </div>
  );
};

export default ResultView;
