export const ScoreCircle = ({score} : {score : number}) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = score / 100;
    const strokedashoffset = circumference * (1 - progress);
    return (
        <div className="relative w-[100px] h-[100px]">
            <svg
                viewBox="0 0 100 100"
                width="100%"
                height="100%"
                // transform rotate(-90) → starts the filling of circle from the top instead of the right side.
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                ></circle>
                {/* stroke-dasharray → defines the pattern of visible + hidden dashes around the circle.
                    stroke-dashoffset → shifts where the dashes start.
                */}
                {/* Partial circle with gradient */}
                <defs>
                    <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stop-color="#5171FF" />
                    <stop offset="100%" stop-color="#FF97AD" />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="url(#grad1)"
                    fill = "transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokedashoffset}
                    strokeLinecap="round"
                ></circle>
            </svg>
            {/* Score and issues */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-sm">{score}/100</span>
                <span className="text-[#475467] text-xs ">{score - 23} issues</span>
            </div>
        </div>
    )
}
