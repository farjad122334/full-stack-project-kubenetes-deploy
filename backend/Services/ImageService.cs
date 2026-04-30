using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace backend.Services;

public class ImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public ImageService(IConfiguration configuration)
    {
        var cloudName = configuration["CLOUDINARY_CLOUD_NAME"];
        var apiKey = configuration["CLOUDINARY_API_KEY"];
        var apiSecret = configuration["CLOUDINARY_API_SECRET"];

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            // Fallback for development if keys are not provided yet
            Console.WriteLine("WARNING: Cloudinary credentials are missing. Image uploads will fail.");
        }

        Account account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string?> SaveImageAsync(IFormFile? file, string folderName)
    {
        if (file == null || file.Length == 0) return null;

        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"safarnama/{folderName}",
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                Console.WriteLine($"Cloudinary Upload Error: {uploadResult.Error.Message}");
                return null;
            }

            return uploadResult.SecureUrl.ToString();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ImageService Exception: {ex.Message}");
            return null;
        }
    }

    public async Task<List<string>> SaveImagesAsync(List<IFormFile> files, string folderName)
    {
        var savedPaths = new List<string>();
        if (files == null || files.Count == 0) return savedPaths;

        foreach (var file in files)
        {
            var path = await SaveImageAsync(file, folderName);
            if (path != null)
                savedPaths.Add(path);
        }

        return savedPaths;
    }

    public void DeleteImage(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl)) return;

        try
        {
            // Extract public ID from Cloudinary URL
            // Format: https://res.cloudinary.com/cloudname/image/upload/v12345678/folder/publicid.jpg
            var uri = new Uri(imageUrl);
            var segments = uri.Segments;
            
            // Find the public ID segment (everything after 'upload/' and before extension)
            // This is a simplified version, works for standard uploads
            string publicIdWithExt = segments[^1];
            string publicId = Path.GetFileNameWithoutExtension(publicIdWithExt);
            
            // If it's in a folder, we need the folder path too
            // Find 'upload/' index
            int uploadIndex = -1;
            for (int i = 0; i < segments.Length; i++)
            {
                if (segments[i].StartsWith("upload/"))
                {
                    uploadIndex = i;
                    break;
                }
            }

            if (uploadIndex != -1 && uploadIndex + 1 < segments.Length)
            {
                // Reconstruct public ID including folders
                var publicIdSegments = new List<string>();
                for (int i = uploadIndex + 2; i < segments.Length - 1; i++) // Skip version (v1234...)
                {
                     publicIdSegments.Add(segments[i].TrimEnd('/'));
                }
                publicIdSegments.Add(publicId);
                
                string fullPublicId = string.Join("/", publicIdSegments);
                var deletionParams = new DeletionParams(fullPublicId);
                _cloudinary.Destroy(deletionParams);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting image from Cloudinary: {ex.Message}");
        }
    }
}
