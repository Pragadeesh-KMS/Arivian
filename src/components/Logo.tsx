import React from "react";

interface LogoProps {
  width?: string;
  height?: string;
  viewBox?: string;
}

const Logo: React.FC<LogoProps> = ({ width = "240", height = "40", viewBox = "0 0 1400 100" }) => (
  <svg
    width={width}
    height={height}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >

    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4d001f"/>
            <stop offset="100%" stopColor="#7a002f"/>
        </linearGradient>

        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7a002f"/>
            <stop offset="100%" stopColor="#a13344"/>
        </linearGradient>

        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a13344"/>
            <stop offset="100%" stopColor="#c64d5a"/>
        </linearGradient>

        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c64d5a"/>
            <stop offset="100%" stopColor="#a13344"/>
        </linearGradient>

        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a13344"/>
            <stop offset="100%" stopColor="#7a002f"/>
        </linearGradient>

        <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="40%" stopColor="#7a002f"/>
            <stop offset="100%" stopColor="#4d001f"/>
        </linearGradient>

        <linearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="40%" stopColor="#4d001f"/>
            <stop offset="100%" stopColor="#7a002f"/>
        </linearGradient>
    </defs>

    <g transform="translate(0, 0)">
    <path fillRule="evenodd" clipRule="evenodd" 
        d="M76.7114 18.5252H64.9388L20.3288 95.2577H0L55.9621 0.824219H85.604L141.692 95.2577H121.237L76.7114 18.5252Z"
        fill="url(#grad1)" fillOpacity="0.85"/>
    </g>

    <g transform="translate(170, 0)">
    <path fillRule="evenodd" clipRule="evenodd"
        d="M731.336 36.6263V31.644C731.333 29.9014 730.953 28.1801 730.221 26.5985C729.467 24.963 728.344 23.5241 726.942 22.394C725.442 21.1955 723.76 20.2445 721.959 19.577C719.935 18.8594 717.8 18.5036 715.653 18.5258H641.737V50.27H715.589C718.057 50.3254 720.513 49.9043 722.821 49.0296C724.655 48.2998 726.321 47.2055 727.72 45.8132C728.954 44.5724 729.895 43.0711 730.474 41.4194C731.04 39.8848 731.332 38.2623 731.336 36.6263ZM747.565 95.2583H725.827L707.075 67.9289H641.737V95.2583H624.036V0.824818H719.668C723.604 0.799814 727.506 1.55728 731.146 3.05321C734.565 4.47556 737.715 6.47362 740.459 8.96055C743.08 11.3344 745.221 14.189 746.766 17.3696C748.261 20.4121 749.045 23.755 749.058 27.1451V40.9149C749.029 43.8477 748.429 46.7467 747.292 49.4501C746.115 52.326 744.529 55.0168 742.583 57.4387C740.645 59.8821 738.341 62.0097 735.75 63.7455C733.355 65.3715 730.661 66.5075 727.825 67.0881L747.565 95.2583Z"
        transform="translate(-624, 0)" fill="url(#grad2)" fillOpacity="0.85"/>
    </g>

    <g transform="translate(330, 0)">
    <path d="M456.655 0.824219H438.954V95.2577H456.655V0.824219Z" transform="translate(-438.954, 0)" fill="url(#grad3)" fillOpacity="0.85"/>
    </g>

    <g transform="translate(370, 0)">
    <path fillRule="evenodd" clipRule="evenodd"
        d="M991.746 0.824219H1012.22L956.133 95.2577H926.47L870.529 0.824219H890.837L935.447 77.5567H947.22L991.746 0.824219Z"
        transform="translate(-870, 0)" fill="url(#grad4)" fillOpacity="0.85"/>
    </g>

    <g transform="translate(540, 0)">
    <path d="M456.655 0.824219H438.954V95.2577H456.655V0.824219Z" transform="translate(-438.954, 0)" fill="url(#grad5)" fillOpacity="0.85"/>
    </g>

    <g transform="translate(580, 0)">
    <path fillRule="evenodd" clipRule="evenodd"
        d="M76.7114 18.5252H64.9388L20.3288 95.2577H0L55.9621 0.824219H85.604L141.692 95.2577H121.237L76.7114 18.5252Z"
        fill="url(#grad6)" fillOpacity="0.85"/>
    </g>

    <g transform="translate(740, 0)">
    <path fillRule="evenodd" clipRule="evenodd"
        d="M258.83 74.6556V0.824219H276.531V95.2577H254.373L171.46 21.2792V95.2577H153.759V0.824219H176.064L258.83 74.6556Z"
        transform="translate(-153, 0)" fill="url(#grad7)" fillOpacity="0.85"/>
    </g>
  </svg>
);

export default Logo;
