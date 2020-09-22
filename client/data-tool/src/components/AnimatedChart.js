import React from "react";

export default function AnimatedGraph() {
  return (
    <>

        <div className="graph__wrapper">
          <div className="coordinates">
            <span className="span"></span>
            <span className="span"></span>
            <span className="span"></span>
            <span className="span"></span>
            <span className="span"></span>
            <span className="span"></span>
          </div>
          <svg className="svg" width="315px" height="107px" viewBox="0 0 315 107" version="1.1">
            <defs>
              <linearGradient x1="0%" y1="100%" x2="100%" y2="100%" id="linearGradient-1">
                <stop stop-color="#2090F8" offset="0%"></stop>
                <stop stop-color="#01FCE4" offset="41.7610013%"></stop>
                <stop stop-color="#0BFF8C" offset="78.6870217%"></stop>
                <stop stop-color="#51FF00" offset="100%"></stop>
              </linearGradient>
            </defs>
            <g1 id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" >
              <clipPath className="clipPath" d="M2.10546875,95.75 L40.5546875,68.3476562 L55.2109375,81.1796875 L65.2148437,76.3945312 L96.1835937,86.8320312 L131.023438,19.9414062 L142.15625,23.7226562 L183.605469,2.1953125 L211.007812,22.3320312 L234.320312,71.5664062 L234.667969,83.0039062 L244.019531,83.0039062 L247.105469,88.8320312 L312.695312,104.839844" id="Path-1" stroke="url(#linearGradient-1)" stroke-width="4" class="path"></clipPath>
            </g1>
          </svg>
        </div>

    </>
  )
}