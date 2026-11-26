// Usage: swift cutout.swift <input.jpg> <outPrefix>
// Writes <outPrefix>_all.png (every foreground subject) and <outPrefix>_<n>.png per instance,
// each cropped to its extent with a transparent background.
import Foundation
import Vision
import CoreImage
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: cutout in outPrefix"); exit(1) }
let url = URL(fileURLWithPath: args[1])
let prefix = args[2]

let handler = VNImageRequestHandler(url: url)
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { print("no subject"); exit(2) }

let ctx = CIContext()
func save(_ buffer: CVPixelBuffer, _ path: String) throws {
  let ci = CIImage(cvPixelBuffer: buffer)
  guard let cg = ctx.createCGImage(ci, from: ci.extent) else { return }
  let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, cg, nil)
  CGImageDestinationFinalize(dest)
  print("\(path) \(Int(ci.extent.width))x\(Int(ci.extent.height))")
}

try save(try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: args.count < 4), "\(prefix)_all.png")
for i in obs.allInstances {
  try save(try obs.generateMaskedImage(ofInstances: IndexSet(integer: i), from: handler, croppedToInstancesExtent: true), "\(prefix)_\(i).png")
}
